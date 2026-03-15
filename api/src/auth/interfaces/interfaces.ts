import { Role, Token, User } from 'generated/prisma/client';
export interface IAccessToken {
  id: string;
  username: string;
  email: string;
  role: Role[];
}

export type JWTPayload = IAccessToken;

export interface ITokens {
  accessToken: string;
  refreshToken: Token;
}
