-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfig" (
    "guildId" BIGINT NOT NULL,
    "boardChannel" BIGINT NOT NULL,
    "minStarCount" INTEGER NOT NULL DEFAULT 5
);
INSERT INTO "new_GuildConfig" ("boardChannel", "guildId", "minStarCount") SELECT "boardChannel", "guildId", "minStarCount" FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
