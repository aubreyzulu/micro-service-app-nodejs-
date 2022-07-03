export type ErrorObject = {
  message: string;
  field?: string;
};
export interface Errors {
  errors: ErrorObject[];
}
