ALTER TABLE "user" ADD COLUMN "lastPasswordChanged" timestamp;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "lastPasswordChange";