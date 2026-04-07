import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1775579895735 implements MigrationInterface {
    name = 'InitTables1775579895735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token_hash" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token_expires_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token_hash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    }

}
