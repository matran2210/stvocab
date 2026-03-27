import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1773590497762 implements MigrationInterface {
    name = 'InitTables1773590497762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD "audio_path" character varying`);
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_2f95ed404d71028b9bab2c6aed8"`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ALTER COLUMN "category_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_2f95ed404d71028b9bab2c6aed8" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_2f95ed404d71028b9bab2c6aed8"`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ALTER COLUMN "category_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_2f95ed404d71028b9bab2c6aed8" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP COLUMN "audio_path"`);
    }

}
