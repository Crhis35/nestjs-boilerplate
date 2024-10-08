export interface SingleJwt {
  secret: string;
  time: number;
}

export interface AccessJwt {
  publicKey: string;
  privateKey: string;
  time: number;
}

export interface JWT {
  access: AccessJwt;
  confirmation: SingleJwt;
  resetPassword: SingleJwt;
  refresh: SingleJwt;
}
