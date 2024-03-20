const Command = require('../../framework/Command');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = class LeaveCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leave',
			aliases: ['leave-voice-channel', 'leave-vc', 'leave-voice', 'leave-channel', 'disconnect'],
			group: 'util-voice',
			memberName: 'leave',
			description: 'Leaves the current voice channel.',
			guildOnly: true,
			guarded: true
		});
	}

	run(msg) {
		const connection = getVoiceConnection(msg.guild.id);
		if (!connection) return msg.reply('I am not in a voice channel.');
		if (this.client.dispatchers.has(msg.guild.id)) {
			const usage = this.client.registry.commands.get('stop').usage();
			return msg.reply(`I am currently playing audio in this server. Please use ${usage} first.`);
		}
		connection.destroy();
		return msg.reply('No more words out of me...');
	}
};
