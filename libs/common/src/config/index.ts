import { join } from 'path';
import { readFileSync } from 'fs';

import SnakeNamingStrategy from 'typeorm-naming-strategy';

import { BaseConfiguration } from './interfaces/config.interface';

export function config(): BaseConfiguration {
  const publicKey = readFileSync(
    join(process.cwd(), './keys/public.key'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(process.cwd(), './keys/private.key'),
    'utf-8',
  );

  const dbOptions: BaseConfiguration['db'] = {
    type: 'postgres',
    host: process.env.DB_HOST, // localhost
    port: parseInt(process.env.DB_PORT), // 5432
    username: process.env.DB_USERNAME, // databse login role username
    password: process.env.DB_PASSWORD, // database login role password
    database: process.env.DB_DATABASE, // db name
    autoLoadEntities: true,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    logging: ['error'],
  };

  return {
    id: process.env.APP_ID,
    url: process.env.URL,
    port: parseInt(process.env.PORT, 10),
    domain: process.env.DOMAIN,
    jwt: {
      access: {
        privateKey,
        publicKey,
        time: parseInt(process.env.JWT_ACCESS_TIME, 10),
      },
      confirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, 10),
      },
    },
    db: dbOptions,
    emailService: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
  };
}
export * from './config.schema';
