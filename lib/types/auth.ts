export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export type AuthUserResponse = {
  data: AuthUser;
};
