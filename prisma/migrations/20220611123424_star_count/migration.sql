/*
  Warnings:

  - Added the required column `minStarCount` to the `GuildConfig` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "UserToMessageMap" (
    "messageId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfig" (
    "guildId" BIGINT NOT NULL,
    "boardChannel" BIGINT NOT NULL,
    "minStarCount" INTEGER NOT NULL
);
INSERT INTO "new_GuildConfig" ("boardChannel", "guildId") SELECT "boardChannel", "guildId" FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UserToMessageMap_messageId_userId_key" ON "UserToMessageMap"("messageId", "userId");
