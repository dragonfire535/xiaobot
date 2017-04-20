const { Command } = require('discord.js-commando');

module.exports = class EmojiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'emoji',
            aliases: [
                'emoticons',
                'emojilist',
                'emoticonlist'
            ],
            group: 'guildinfo',
            memberName: 'emoji',
            description: 'Gives a list of the current server\'s emoji. (x;emoji)',
            examples: ['x;emoji'],
            guildOnly: true
        });
    }

    run(message) {
        if (message.channel.type !== 'dm') {
            if (!message.channel.permissionsFor(this.client.user).hasPermission(['SEND_MESSAGES', 'READ_MESSAGES'])) return;
        }
        return message.say(message.guild.emojis.map(e => e).join('')).catch(() => message.say(':x: Error! Something went wrong!'));
    }
};
