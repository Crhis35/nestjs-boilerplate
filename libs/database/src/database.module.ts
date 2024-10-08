import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

import * as entities from './entities';

export const ENTITIES = Object.values(entities);

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
