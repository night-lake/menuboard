import { ChannelType } from 'discord-api-types/v10';
import { SlashCommand } from 'slashasaurus';
import { inspect } from 'util';

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
        run: async (interaction, _client, options) => {
            // const channel = options.channel
            // const guildClientUser = await interaction.guild.members.fetch(client.user.id);

            // if (!channel.permissionsFor(guildClientUser).has('SEND_MESSAGES')) {
            //     return interaction.reply({ content: 'The bot cannot send messages in this channel.', ephemeral: true });
            // }

            interaction.reply({ embeds: [{ description: inspect(options.channel) }] });
        }
    }
);
