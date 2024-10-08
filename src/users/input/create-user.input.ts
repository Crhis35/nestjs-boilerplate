import { InputType, OmitType } from '@nestjs/graphql';

import { User } from '@libs/database/entities';

@InputType()
export class CreateUserInput extends OmitType(User, [
  'id',
  'createdAt',
  'updatedAt',
  'active',
] as const) {}

@InputType()
export class CreateAdminUserInput extends OmitType(User, [
  'id',
  'createdAt',
  'updatedAt',
  'active',
] as const) {}
