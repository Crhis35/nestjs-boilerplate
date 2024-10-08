import { User } from '@libs/database/entities';
import { Injectable } from '@nestjs/common';
import { PickType } from '@nestjs/graphql';

@Injectable()
export class UpdatePasswordInput extends PickType(User, [
  'id',
  'password',
] as const) {}
