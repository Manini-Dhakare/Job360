export interface ResponseMeta {
  timestamp: string;
  request_id: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta: ResponseMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  meta: ResponseMeta;
}
