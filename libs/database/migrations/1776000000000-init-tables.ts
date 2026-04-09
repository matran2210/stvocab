import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTables1776000000000 implements MigrationInterface {
  name = 'InitTables1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "game_play_turns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "user_id" uuid NOT NULL,
        "game_type" character varying NOT NULL,
        "date" date NOT NULL,
        "turn_number" integer NOT NULL DEFAULT '0',
        "limit" integer NOT NULL DEFAULT '3',
        CONSTRAINT "PK_game_play_turns_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_GAME_PLAY_TURN_USER_GAME_DATE"
      ON "game_play_turns" ("user_id", "game_type", "date")
    `);
    await queryRunner.query(`
      ALTER TABLE "game_play_turns"
      ADD CONSTRAINT "FK_game_play_turns_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_play_turns" DROP CONSTRAINT "FK_game_play_turns_user_id"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_GAME_PLAY_TURN_USER_GAME_DATE"
    `);
    await queryRunner.query(`
      DROP TABLE "game_play_turns"
    `);
  }
}
