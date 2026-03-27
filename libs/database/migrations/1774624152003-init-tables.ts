import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1774624152003 implements MigrationInterface {
    name = 'InitTables1774624152003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "time_trial"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "time_trial" boolean NOT NULL DEFAULT true`);
    }

}
