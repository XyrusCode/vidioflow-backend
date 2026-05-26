import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1716000000000 implements MigrationInterface {
  name = 'InitSchema1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."projects_status_enum" AS ENUM(
        'pending', 'processing', 'completed', 'failed'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id"              uuid                              NOT NULL DEFAULT uuid_generate_v4(),
        "name"            character varying(255)            NOT NULL,
        "description"     text,
        "created_at"      TIMESTAMP                         NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP                         NOT NULL DEFAULT now(),
        "status"          "public"."projects_status_enum"   NOT NULL DEFAULT 'pending',
        "final_video_url" character varying(500),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."automation_steps_action_type_enum" AS ENUM(
        'navigate', 'click', 'fill', 'wait'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "automation_steps" (
        "id"          uuid                                          NOT NULL DEFAULT uuid_generate_v4(),
        "project_id"  uuid                                          NOT NULL,
        "step_order"  integer                                       NOT NULL,
        "action_type" "public"."automation_steps_action_type_enum"  NOT NULL,
        "selector"    character varying(500),
        "value"       text,
        CONSTRAINT "PK_automation_steps" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_steps_project_order"
      ON "automation_steps" ("project_id", "step_order")
    `);

    await queryRunner.query(`
      CREATE TABLE "scripts" (
        "id"           uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "project_id"   uuid                   NOT NULL,
        "text_content" text                   NOT NULL,
        "voice_model"  character varying(100) NOT NULL DEFAULT 'en-US-AriaNeural',
        CONSTRAINT "UQ_scripts_project_id" UNIQUE ("project_id"),
        CONSTRAINT "PK_scripts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "automation_steps"
      ADD CONSTRAINT "FK_steps_project"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "scripts"
      ADD CONSTRAINT "FK_scripts_project"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scripts" DROP CONSTRAINT "FK_scripts_project"`);
    await queryRunner.query(`ALTER TABLE "automation_steps" DROP CONSTRAINT "FK_steps_project"`);
    await queryRunner.query(`DROP INDEX "IDX_steps_project_order"`);
    await queryRunner.query(`DROP TABLE "scripts"`);
    await queryRunner.query(`DROP TABLE "automation_steps"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TYPE "public"."automation_steps_action_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
  }
}
