import { AccessPayload } from './access-token.interface';
import { TokenBase } from './token-base.interface';

export interface EmailPayload extends AccessPayload {
  version: number;
}

export interface EmailToken extends EmailPayload, TokenBase {}
