export type ErrorObject = {
  message: string;
  field?: string;
};
export interface Errors {
  errors: ErrorObject[];
}

export interface CurrentUser {
  id: string;
  email: string;
  iat: number;
}
