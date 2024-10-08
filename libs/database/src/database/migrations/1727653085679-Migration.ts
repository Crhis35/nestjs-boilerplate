import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1727653085679 implements MigrationInterface {
  name = 'Migration1727653085679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "active" boolean DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "name" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "credentials_version" integer NOT NULL, "credentials_last_password" character varying, "credentials_last_salt" character varying, "credentials_salt" character varying, "credentials_password_updated_at" integer NOT NULL DEFAULT '1727653088', "credentials_updated_at" integer NOT NULL DEFAULT '1727653088', CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
