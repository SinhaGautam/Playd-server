export interface ApiMeta {
  requestId: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown };
  meta: ApiMeta;
}

export class ApiResponse {
  public static success<T>(data: T, requestId: string): ApiSuccessResponse<T> {
    return { success: true, data, meta: { requestId } };
  }

  public static error(code: string, message: string, requestId: string, details?: unknown): ApiErrorResponse {
    return {
      success: false,
      error: { code, message, ...(details === undefined ? {} : { details }) },
      meta: { requestId }
    };
  }
}