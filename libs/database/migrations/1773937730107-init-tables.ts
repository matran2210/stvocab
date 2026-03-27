import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1773937730107 implements MigrationInterface {
    name = 'InitTables1773937730107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD "meaning" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD "phonetic" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP COLUMN "phonetic"`);
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP COLUMN "meaning"`);
    }

}
