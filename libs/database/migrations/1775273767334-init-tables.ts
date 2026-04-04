import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1775273767334 implements MigrationInterface {
    name = 'InitTables1775273767334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "image_url" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "is_stackable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "items" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "items" ADD "metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "is_stackable"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`);
    }

}
