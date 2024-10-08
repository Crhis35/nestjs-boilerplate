import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm/src/module';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';

import { ENTITIES } from '@libs/database';
import { User } from '@libs/database/entities';

import { CreateUserInput } from './input/create-user.input';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      // import the NestjsQueryTypeOrmModule to register the entity with typeorm
      // and provide a QueryService
      imports: [NestjsQueryTypeOrmModule.forFeature(ENTITIES)],
      // describe the resolvers you want to expose
      resolvers: [
        {
          DTOClass: User,
          EntityClass: User,
          CreateDTOClass: CreateUserInput,
        },
      ],
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
