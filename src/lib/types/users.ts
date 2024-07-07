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
