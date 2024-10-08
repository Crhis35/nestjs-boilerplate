import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';

import { User } from '@libs/database/entities';

@InputType()
export class SignInInput extends PickType(User, ['username'] as const) {
  @Field(() => String)
  password: string;
}

@ObjectType()
export class SignInOutput {
  @Field(() => User)
  user: User;

  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;

  @Field(() => Int)
  expiresIn: number;
}
