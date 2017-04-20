const { Command } = require('discord.js-commando');

module.exports = class KillCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kill',
            group: 'roleplay',
            memberName: 'kill',
            description: 'Kills someone. (x;kill @User)',
            examples: ['x;kill @User'],
            args: [{
                key: 'thing',
                prompt: 'What do you want to roleplay with?',
                type: 'string'
            }]
        });
    }

    run(message, args) {
        if (message.channel.type !== 'dm') {
            if (!message.channel.permissionsFor(this.client.user).hasPermission(['SEND_MESSAGES', 'READ_MESSAGES'])) return;
        }
        const { thing } = args;
        return message.say(`${message.author} *kills* ${thing}`);
    }
};
