import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1774623893606 implements MigrationInterface {
    name = 'InitTables1774623893606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

}
