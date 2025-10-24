export interface User {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  aud?: number;
  iss?: number;
}
