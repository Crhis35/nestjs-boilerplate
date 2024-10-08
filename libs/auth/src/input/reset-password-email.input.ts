import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordEmailInput {
  @Field(() => String)
  email: string;
}
