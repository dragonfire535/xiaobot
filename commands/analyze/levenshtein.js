const Command = require('../../structures/Command');
const leven = require('leven');

module.exports = class LevenshteinCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'levenshtein',
			aliases: ['leven'],
			group: 'analyze',
			memberName: 'levenshtein',
			description: 'Determines the levenshtein distance between two strings.',
			args: [
				{
					key: 'text1',
					prompt: 'What is the first text you would like to compare?',
					type: 'string'
				},
				{
					key: 'text2',
					prompt: 'What is the second text you would like to compare?',
					type: 'string'
				}
			]
		});
	}

	run(msg, { text1, text2 }) {
		const distance = leven(text1, text2);
		return msg.reply(distance);
	}
};