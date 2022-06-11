import { db } from '../../db';
import { MessageCommand } from 'slashasaurus';
import { Guild, GuildMember, Message, MessageEmbed, User } from 'discord.js';

async function getNickname(guild: Guild, user: User) {
    if (!guild) {
        return user.username;
    }

    let member: User | GuildMember = user;

    if (!(member instanceof GuildMember)) {
        member = await guild.members.fetch(user);
    }

    return member?.nickname ?? member.user.tag;
}

export default new MessageCommand(
    {
        name: 'Star'
    },
    async interaction => {
        const message = interaction.targetMessage as Message;
        const id = interaction.targetMessage.id;
        const author = interaction.targetMessage.author as User;

        // ANCHOR: Check if user has already starred this message.
        const userHasStarred = await db.userToMessageMap.findUnique({
            where: {
                messageId_userId: {
                    messageId: BigInt(id),
                    userId: BigInt(interaction.user.id)
                }
            }
        });

        if (userHasStarred) {
            return interaction.reply({ content: 'You have already starred that message.', ephemeral: true });
        }

        // ANCHOR: No starboard channel set check & get `minStarCount`
        const guildConfig = await db.guildConfig.findFirst({
            select: {
                boardChannel: true,
                minStarCount: true
            },
            where: {
                guildId: BigInt(interaction.guildId)
            }
        });

        if (!guildConfig?.boardChannel) {
            return interaction.reply({ content: 'No starboard channel has been set.', ephemeral: true });
        }

        const { boardChannel, minStarCount } = guildConfig;

        // ANCHOR: Permissions check & self-star check
        if (!interaction.channel.permissionsFor(interaction.guild.roles.everyone).has('VIEW_CHANNEL')) {
            return interaction.reply({ content: 'You cannot star messages from this channel.', ephemeral: true });
        }

        if (author.id === interaction.user.id) {
            return interaction.reply(`Bad <@${author.id}>, trying to star their own message.`);
        }

        // ANCHOR: Get star data & upsert the new star count
        const starData = await db.starQueue.findFirst({
            select: {
                starCount: true
            },
            where: {
                messageId: BigInt(id)
            }
        });

        if (!starData || starData?.starCount < minStarCount) {
            await db.starQueue.upsert({
                create: {
                    messageId: BigInt(id),
                    starCount: 1
                },
                update: {
                    starCount: (starData?.starCount ?? 0) + 1
                },
                where: {
                    messageId: BigInt(id)
                }
            });

            await db.userToMessageMap.create({
                data: {
                    messageId: BigInt(id),
                    userId: BigInt(interaction.user.id)
                }
            });

            return interaction.reply({ content: 'Just a few stars missing.', ephemeral: true });
        }

        // ANCHOR: Post message to starboard
        const { starCount } = starData;

        if (starCount > minStarCount) {
            await db.userToMessageMap.create({
                data: {
                    messageId: BigInt(id),
                    userId: BigInt(interaction.user.id)
                }
            });

            return interaction.reply({
                content: 'We appreciate the enthusiam but this message has already been starred.',
                ephemeral: true
            });
        }

        if (starCount === minStarCount) {
            const channel = await interaction.guild.channels.fetch(boardChannel.toString());

            const embed = new MessageEmbed()
                .setAuthor({
                    name: await getNickname(interaction.guild, author),
                    iconURL: author.avatarURL({ format: 'png' })
                })
                .setColor('GOLD')
                .setDescription(message.content);

            // ANCHOR: Get the first image to display in the embed.
            const image = message.attachments.find(
                attachment => attachment.name.endsWith('.png') || attachment.name.endsWith('.jpg')
            );

            if (image != null) {
                embed.setImage(image.url);
            }

            if (channel.isText()) {
                channel.send({
                    embeds: [embed]
                });
            }

            return interaction.reply({ content: ':star: Off to the chart!', ephemeral: true });
        }
    }
);
