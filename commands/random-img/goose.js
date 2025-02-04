const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const request = require('node-superfetch');

module.exports = class GooseCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'goose',
			aliases: ['geese'],
			group: 'random-img',
			description: 'Responds with a random goose image.',
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'nekos.life',
					url: 'https://nekos.life/',
					reason: 'API'
				}
			]
		});
	}

	async run(msg) {
		const { body } = await request.get('https://nekos.life/api/v2/img/goose');
		return msg.say({ files: [body.url] });
	}
};
