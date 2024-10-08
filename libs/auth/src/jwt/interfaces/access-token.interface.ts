import { TokenBase } from './token-base.interface';

export interface AccessPayload {
  id: string;
}

export interface AccessToken extends AccessPayload, TokenBase {}
