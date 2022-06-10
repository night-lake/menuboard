import { ChannelType } from 'discord-api-types/v10';
import { Channel } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { SlashCommand } from 'slashasaurus';

export default new SlashCommand(
    {
        name: 'starboard',
        description: 'Set the starboard channel',
        options: [
            {
                channelTypes: [ChannelType.GuildText, ChannelType.GuildNews],
                name: 'channel',
                description: 'The channel to send starred messages to.',
                type: 'CHANNEL',
                required: true
            }
        ]
    },
    {
        run: async (interaction, client, { channel }) => {
            const guildClientUser = await interaction.guild.members.fetch(client.user.id);

            if (!interaction.channel.permissionsFor(guildClientUser).has('SEND_MESSAGES')) {
                return interaction.reply({ content: 'The bot cannot send messages in this channel.', ephemeral: true });
            }

			gui
        }
    }
);
