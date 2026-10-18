import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../database/prisma.js";
export async function audit(
  userId: string | null,
  action: string,
  targetType: string,
  targetId: string | null,
  metadata?: unknown,
): Promise<void> {
  const auditLog = (
    prisma as unknown as {
      auditLog: {
        create(args: {
          data: {
            userId: string | null;
            action: string;
            targetType: string;
            targetId: string | null;
            metadata?: Prisma.InputJsonValue;
          };
        }): Promise<unknown>;
      };
    }
  ).auditLog;

  await auditLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      ...(metadata === undefined
        ? {}
        : { metadata: metadata as Prisma.InputJsonValue }),
    },
  });
}
