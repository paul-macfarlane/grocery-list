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

export class UpdateUserError extends Error {
  constructor(message: string, code: number) {
    super(message);
    this.name = "UpdateUserError";
    this.code = code;
    Object.setPrototypeOf(this, UpdateUserError.prototype);
  }

  code: number;
}
