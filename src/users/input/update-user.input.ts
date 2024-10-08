import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { User } from '@libs/database/entities';

@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(User, ['id', 'createdAt', 'updatedAt', 'active'] as const),
) {}

@InputType()
export class UpdateAdminUserInput extends OmitType(User, [
  'createdAt',
  'updatedAt',
  'active',
] as const) {}
