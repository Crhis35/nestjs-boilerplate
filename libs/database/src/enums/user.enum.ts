export enum UserRoles {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export type AllowedRoles = keyof typeof UserRoles | 'Any';
