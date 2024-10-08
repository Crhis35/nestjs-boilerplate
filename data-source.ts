import * as dotenv from 'dotenv';

import { DataSource, DataSourceOptions } from 'typeorm';

import SnakeNamingStrategy from 'typeorm-naming-strategy';
import { SeederOptions } from 'typeorm-extension';

dotenv.config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST, // localhost
  port: parseInt(process.env.DB_PORT), // 5432
  username: process.env.DB_USERNAME, // databse login role username
  password: process.env.DB_PASSWORD, // database login role password
  database: process.env.DB_DATABASE, // db name
  namingStrategy: new SnakeNamingStrategy(),

  // We are using migrations, synchronize should be set to false.
  // synchronize: process.env.DB_SYNCHRONIZE
  //  ? process.env.DB_SYNCHRONIZE.toLowerCase() === 'true'
  //  : false,
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: false,

  logging: false,
  logger: 'advanced-console',

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: ['libs/database/src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',

  seeds: ['libs/database/src/database/seeds/**/*{.ts,.js}'],
  factories: ['libs/database/src/database/factories/**/*{.ts,.js}'],

  entities: ['libs/database/src/entities/**/*{.ts,.js}'],
};

export const dataSource: DataSource = new DataSource(options);
