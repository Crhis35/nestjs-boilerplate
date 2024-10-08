import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
  @Field(() => String)
  password: string;

  @Field(() => String)
  resetToken: string;
}
