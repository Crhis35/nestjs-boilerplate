import { Column, Entity } from 'typeorm';
import { IsEmail } from 'class-validator';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { UserRoles } from '../enums';

import { CoreEntity } from '../models';
import { CredentialsEmbedded } from '../embeddeds';

registerEnumType(UserRoles, {
  name: 'UserRoles',
});

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Field(() => String)
  @Column()
  lastName: string;

  @IsEmail()
  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column(() => CredentialsEmbedded)
  credentials: CredentialsEmbedded;
}
