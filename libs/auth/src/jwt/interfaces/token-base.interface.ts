export interface TokenBase {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  sub: string;
}
