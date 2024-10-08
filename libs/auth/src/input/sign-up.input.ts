import { Field, InputType, Int, ObjectType, OmitType } from '@nestjs/graphql';

import { User } from '@libs/database/entities';

@InputType()
export class SignUpInput extends OmitType(User, [
  'id',
  'createdAt',
  'updatedAt',
  'active',
] as const) {
  @Field(() => String)
  password: string;
}

@ObjectType()
export class SignUpOutput {
  @Field(() => User)
  user: User;

  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;

  @Field(() => Int)
  expiresIn: number;
}
