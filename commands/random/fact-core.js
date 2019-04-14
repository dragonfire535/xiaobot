const Command = require('../../structures/Command');
const facts = require('../../assets/json/fact-core');

module.exports = class FactCoreCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fact-core',
			group: 'random',
			memberName: 'fact-core',
			description: 'Responds with a random Fact Core quote.',
			credit: [
				{
					name: 'Portal 2',
					url: 'http://www.thinkwithportals.com/'
				}
			]
		});
	}

	run(msg) {
		return msg.say(facts[Math.floor(Math.random() * facts.length)]);
	}
};
