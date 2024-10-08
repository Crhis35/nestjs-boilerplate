import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ENTITIES } from '@libs/database';

import { JwtService } from './jwt.service';
import { CommonModule } from '@libs/common';

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES), CommonModule],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
