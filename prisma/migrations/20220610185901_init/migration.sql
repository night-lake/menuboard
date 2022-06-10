-- CreateTable
CREATE TABLE "StarQueue" (
    "messageId" BIGINT NOT NULL,
    "starCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "GuildConfig" (
    "guildId" BIGINT NOT NULL,
    "boardChannel" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StarQueue_messageId_key" ON "StarQueue"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
