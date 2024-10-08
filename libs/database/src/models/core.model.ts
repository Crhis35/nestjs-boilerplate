import { IsBoolean } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Field,
  GraphQLISODateTime,
  ID,
  InputType,
  ObjectType,
} from '@nestjs/graphql';
import { FilterableField, IDField } from '@ptc-org/nestjs-query-graphql';

@ObjectType()
export class CoreEntity {
  @IDField(() => ID)
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
  })
  id: string;

  @IsBoolean()
  @FilterableField(() => Boolean)
  @Column({ type: 'boolean', nullable: true, default: true })
  active: boolean;

  @FilterableField(() => GraphQLISODateTime)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @FilterableField(() => GraphQLISODateTime)
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}

@InputType('S3ObjectInputType')
@ObjectType()
export class S3Object {
  @Field(() => String)
  key: string;

  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  url?: string;
}
