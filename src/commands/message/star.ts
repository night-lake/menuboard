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

        const { starCount } = await db.starQueue.findFirst({
            select: {
                starCount: true
            },
            where: {
                messageId: BigInt(id)
            }
        });

        const { boardChannel } = await db.guildConfig.findFirst({
            select: {
                boardChannel: true
            },
            where: {
                guildId: BigInt(interaction.guildId)
            }
        });

        if (!boardChannel) {
            return interaction.reply({ content: 'No starboard channel has been set.', ephemeral: true });
        }

        if (!interaction.channel.permissionsFor(interaction.guild.roles.everyone).has('VIEW_CHANNEL')) {
            return interaction.reply({ content: 'You cannot star messages from this channel.', ephemeral: true });
        }

        if (author.id === interaction.user.id) {
            return interaction.reply(`Bad <@${author.id}>, trying to star their own message.`);
        }

        if (!starCount ?? starCount < 4) {
            db.starQueue.upsert({
                create: {
                    messageId: BigInt(id),
                    starCount: 1
                },
                update: {
                    starCount: starCount + 1
                },
                where: {
                    messageId: BigInt(id)
                }
            });

            return interaction.reply({ content: 'Just a few stars missing.', ephemeral: true });
        }

        if (starCount > 4) {
            const channel = await interaction.guild.channels.fetch(boardChannel.toString());

            const embed = new MessageEmbed()
                .setAuthor({
                    name: await getNickname(interaction.guild, author),
                    iconURL: author.avatarURL({ format: 'png' })
                })
                .setColor('GOLD')
                .setDescription(message.content);

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
