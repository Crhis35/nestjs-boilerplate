import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@libs/common';
import { ENTITIES } from '@libs/database';

import { MailerModule } from '@libs/mailer';
import { JwtModule } from './jwt/jwt.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    CommonModule,
    JwtModule,
    MailerModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
