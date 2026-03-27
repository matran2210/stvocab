import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1773572512942 implements MigrationInterface {
    name = 'InitTables1773572512942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "type" character varying NOT NULL, "rarity_star" integer NOT NULL DEFAULT '4', "price_gold" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quantity" integer NOT NULL DEFAULT '1', "acquired_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "item_id" uuid, CONSTRAINT "PK_193d6e1b301eda020c2492d3d9c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "username" character varying, "phone" character varying, "status" character varying NOT NULL DEFAULT 'active', "is_onboarded" boolean NOT NULL DEFAULT false, "time_trial" boolean NOT NULL DEFAULT true, "trial_expiration" TIMESTAMP, "package_level" character varying NOT NULL DEFAULT 'Basic', "gold" integer NOT NULL DEFAULT '0', "learning_points" integer NOT NULL DEFAULT '0', "pity_counter" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "learning_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "is_correct" boolean NOT NULL, "user_id" uuid, "vocabulary_id" uuid, CONSTRAINT "PK_859ce04e681ecea5104e5584353" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocabularies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "word" character varying NOT NULL, "level" character varying NOT NULL, "storyline" text, "general" text, "image_path" character varying, "total_attempts" integer NOT NULL DEFAULT '0', "wrong_attempts" integer NOT NULL DEFAULT '0', "category_id" uuid, CONSTRAINT "PK_1f0c8d5539ccaf456ebf73cabb5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "test_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "score" integer NOT NULL DEFAULT '0', "number_attempt" integer NOT NULL DEFAULT '0', "user_id" uuid, "category_id" uuid, CONSTRAINT "PK_a2cda27ad74a09c50e71c46259b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "message" text NOT NULL, "user_id" uuid, CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "checkin_date" date NOT NULL, "is_x2_reward" boolean NOT NULL DEFAULT false, "reward_type" character varying, "user_id" uuid, CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_inventory" ADD CONSTRAINT "FK_4e23c453e03c0a8c71f83dabfda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_inventory" ADD CONSTRAINT "FK_3233e26c68f0e1684ffd938edec" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "learning_logs" ADD CONSTRAINT "FK_7f905df13bf2f9f2a38f2dccc84" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "learning_logs" ADD CONSTRAINT "FK_3ce50cfca0151b50c025fc697f1" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_2f95ed404d71028b9bab2c6aed8" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_histories" ADD CONSTRAINT "FK_223ddef8a323bd9294ac880f1fb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_histories" ADD CONSTRAINT "FK_e157f88e612fe4f287b1c8a8fa6" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_5588b6cea298cedec7063c0d33e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_aa902e05aeb5fde7c1dd4ced2b7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_aa902e05aeb5fde7c1dd4ced2b7"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_5588b6cea298cedec7063c0d33e"`);
        await queryRunner.query(`ALTER TABLE "test_histories" DROP CONSTRAINT "FK_e157f88e612fe4f287b1c8a8fa6"`);
        await queryRunner.query(`ALTER TABLE "test_histories" DROP CONSTRAINT "FK_223ddef8a323bd9294ac880f1fb"`);
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_2f95ed404d71028b9bab2c6aed8"`);
        await queryRunner.query(`ALTER TABLE "learning_logs" DROP CONSTRAINT "FK_3ce50cfca0151b50c025fc697f1"`);
        await queryRunner.query(`ALTER TABLE "learning_logs" DROP CONSTRAINT "FK_7f905df13bf2f9f2a38f2dccc84"`);
        await queryRunner.query(`ALTER TABLE "user_inventory" DROP CONSTRAINT "FK_3233e26c68f0e1684ffd938edec"`);
        await queryRunner.query(`ALTER TABLE "user_inventory" DROP CONSTRAINT "FK_4e23c453e03c0a8c71f83dabfda"`);
        await queryRunner.query(`DROP TABLE "attendances"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TABLE "test_histories"`);
        await queryRunner.query(`DROP TABLE "vocabularies"`);
        await queryRunner.query(`DROP TABLE "learning_logs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_inventory"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
