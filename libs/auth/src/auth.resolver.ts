import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { User } from '@libs/database/entities';

import { SignInOutput, SignInInput } from './input/sign-in.input';
import { SignUpOutput, SignUpInput } from './input/sign-up.input';

import { AuthService } from './auth.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(private usersService: AuthService) {}

  @Mutation(() => SignUpOutput)
  async signUp(@Args('input') input: SignUpInput) {
    return this.usersService.signUp(input);
  }

  @Mutation(() => SignInOutput)
  async signIn(@Args('input') input: SignInInput) {
    return this.usersService.signIn(input);
  }
}
