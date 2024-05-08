const Command = require('../../framework/Command');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const request = require('node-superfetch');
const { shorten } = require('../../util/Util');
const logos = require('../../assets/json/logos');

module.exports = class WikipediaCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'wikipedia',
			group: 'search',
			memberName: 'wikipedia',
			description: 'Searches Wikipedia for your query.',
			clientPermissions: [PermissionFlagsBits.EmbedLinks],
			credit: [
				{
					name: 'Wikipedia',
					url: 'https://www.wikipedia.org/',
					reason: 'API',
					reasonURL: 'https://en.wikipedia.org/w/api.php'
				}
			],
			args: [
				{
					key: 'query',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { query }) {
		const { body } = await request
			.get('https://en.wikipedia.org/w/api.php')
			.query({
				action: 'query',
				prop: 'extracts|pageimages',
				format: 'json',
				titles: query,
				exintro: '',
				explaintext: '',
				redirects: '',
				formatversion: 2
			});
		const data = body.query.pages[0];
		if (data.missing) return msg.say('Could not find any results.');
		let thumbnail = data.thumbnail ? data.thumbnail.source : null;
		if (!msg.channel.nsfw && thumbnail) {
			const img = await request.get(data.thumbnail.source);
			const nsfw = this.client.tensorflow.isImageNSFW(img.body);
			if (nsfw) thumbnail = null;
		}
		const embed = new EmbedBuilder()
			.setColor(0xE7E7E7)
			.setTitle(data.title)
			.setAuthor({ name: 'Wikipedia', iconURL: logos.wikipedia, url: 'https://www.wikipedia.org/' })
			.setURL(`https://en.wikipedia.org/wiki/${encodeURIComponent(query).replaceAll(')', '%29')}`)
			.setThumbnail(thumbnail)
			.setDescription(shorten(data.extract.replaceAll('\n', '\n\n')));
		return msg.embed(embed);
	}
};
