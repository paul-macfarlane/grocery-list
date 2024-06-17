export const GOOGLE_CSRF_STATE_NAME = "csrf_state";
export const GOOGLE_COOKIE_PATH = "/auth/google";

export type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};
