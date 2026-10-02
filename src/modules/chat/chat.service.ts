import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export interface ConversationSummary {
  id: string;
  matchId: string;
  createdAt: string;
  otherUser: { userId: string; displayName: string; avatarUrl: string | null };
}

export interface Message {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
}

async function getActiveMatchForUser(userId: string, matchId: string): Promise<void> {
  const result = await db.query(
    `SELECT 1 FROM matches
     WHERE id = $1 AND status = 'active'
       AND (user_a_id = $2 OR user_b_id = $2)`,
    [matchId, userId]
  );
  if (!result.rowCount) throw new AppError('MATCH_NOT_FOUND', 'Active match not found.', 404);
}

export async function getOrCreateConversation(userId: string, matchId: string): Promise<ConversationSummary> {
  await getActiveMatchForUser(userId, matchId);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const conversation = await client.query<{ id: string; createdAt: string; matchId: string }>(
      `INSERT INTO conversations (match_id)
       VALUES ($1)
       ON CONFLICT (match_id) DO UPDATE SET match_id = EXCLUDED.match_id
       RETURNING id, match_id AS "matchId", created_at AS "createdAt"`,
      [matchId]
    );

    const conversationId = conversation.rows[0]!.id;
    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id)
       SELECT $1, user_id FROM matches
       WHERE id = $2
       ON CONFLICT DO NOTHING`,
      [conversationId, matchId]
    );

    const result = await client.query<ConversationSummary>(
      `SELECT c.id, c.match_id AS "matchId", c.created_at AS "createdAt",
              json_build_object(
                'userId', CASE WHEN m.user_a_id = $2 THEN m.user_b_id ELSE m.user_a_id END,
                'displayName', p.display_name,
                'avatarUrl', p.avatar_url
              ) AS "otherUser"
       FROM conversations c
       JOIN matches m ON m.id = c.match_id
       JOIN user_profiles p ON p.user_id = CASE WHEN m.user_a_id = $2 THEN m.user_b_id ELSE m.user_a_id END
       WHERE c.id = $1`,
      [conversationId, userId]
    );

    await client.query('COMMIT');
    return result.rows[0]!;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function requireConversationMember(userId: string, conversationId: string): Promise<void> {
  const result = await db.query(
    `SELECT 1
     FROM conversation_members cm
     JOIN conversations c ON c.id = cm.conversation_id
     JOIN matches m ON m.id = c.match_id AND m.status = 'active'
     WHERE cm.conversation_id = $1 AND cm.user_id = $2`,
    [conversationId, userId]
  );
  if (!result.rowCount) throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404);
}

export async function listMessages(userId: string, conversationId: string, limit: number, beforeId?: string): Promise<Message[]> {
  await requireConversationMember(userId, conversationId);

  const result = await db.query<Message>(
    `SELECT id::text, sender_user_id AS "senderUserId", body,
            created_at AS "createdAt", edited_at AS "editedAt"
     FROM messages
     WHERE conversation_id = $1
       AND deleted_at IS NULL
       AND ($2::bigint IS NULL OR id < $2::bigint)
     ORDER BY id DESC
     LIMIT $3`,
    [conversationId, beforeId ?? null, limit]
  );

  return result.rows;
}

export async function sendMessage(userId: string, conversationId: string, body: string): Promise<Message> {
  await requireConversationMember(userId, conversationId);

  const result = await db.query<Message>(
    `INSERT INTO messages (conversation_id, sender_user_id, body)
     VALUES ($1, $2, $3)
     RETURNING id::text, sender_user_id AS "senderUserId", body,
               created_at AS "createdAt", edited_at AS "editedAt"`,
    [conversationId, userId, body.trim()]
  );

  return result.rows[0]!;
}
