export type UserInfo = {
  id: string;
  authProvider: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicUrl: string;
};

export type UserSession = {
  id: string;
  userId: string;
  csrfToken: string;
  authProvider: string;
  expiresAt: Date;
};

export type UpdateUserInfo = {
  username: string;
};

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
