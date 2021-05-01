const Command = require('../../structures/Command');
const request = require('node-superfetch');
const cheerio = require('cheerio');
const { Readable } = require('stream');
const { reactIfAble, base64, list } = require('../../util/Util');
const playlists = require('../../assets/json/guess-song');
const { SPOTIFY_KEY, SPOTIFY_SECRET } = process.env;

module.exports = class GuessSongCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-song',
			aliases: ['song-guess', 'song-game', 'music-guess', 'guess-music', 'music-game'],
			group: 'games-sp',
			memberName: 'guess-song',
			description: 'Guess what song is playing.',
			throttling: {
				usages: 2,
				duration: 15
			},
			guildOnly: true,
			userPermissions: ['CONNECT', 'SPEAK'],
			clientPermissions: ['ATTACH_FILES'],
			credit: [
				{
					name: 'Spotify',
					url: 'https://www.spotify.com/us/',
					reason: 'API',
					reasonURL: 'https://developer.spotify.com/'
				}
			],
			args: [
				{
					key: 'chart',
					prompt: `What chart do you want to use for the game? Either ${list(Object.keys(playlists, 'or'))}.`,
					type: 'string',
					oneOf: Object.keys(playlists),
					parse: chart => chart.toLowerCase()
				}
			]
		});

		this.token = null;
		this.charts = new Map();
		this.cache = new Map();
	}

	async run(msg, { chart }) {
		const connection = this.client.voice.connections.get(msg.guild.id);
		if (!connection) {
			const usage = this.client.registry.commands.get('join').usage();
			return msg.reply(`I am not in a voice channel. Use ${usage} to fix that!`);
		}
		const current = this.client.games.get(msg.channel.id);
		if (current) return msg.reply(`Please wait until the current game of \`${current.name}\` is finished.`);
		if (this.client.dispatchers.has(msg.guild.id)) return msg.reply('I am already playing audio in this server.');
		this.client.games.set(msg.channel.id, { name: this.name });
		let songID;
		try {
			if (!this.token) await this.fetchToken();
			const data = await this.fetchRandomSong(chart);
			const { body: previewBody } = await request.get(data.preview);
			const dispatcher = connection.play(Readable.from([previewBody]));
			this.client.dispatchers.set(msg.guild.id, dispatcher);
			dispatcher.once('finish', () => this.client.dispatchers.delete(msg.guild.id));
			dispatcher.once('error', () => this.client.dispatchers.delete(msg.guild.id));
			await reactIfAble(msg, this.client.user, '🔉');
			await msg.reply('**You have 30 seconds, what song is this?**');
			const msgs = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
				max: 1,
				time: 30000
			});
			this.client.games.delete(msg.channel.id);
			dispatcher.end();
			this.client.dispatchers.delete(msg.guild.id);
			if (!msgs.size) return msg.reply(`Time! It's **${data.name}** by **${data.artist}**!`);
			const guess = msgs.first().content.toLowerCase();
			if (!guess.includes(data.name.toLowerCase())) {
				return msg.reply(`Nope! It's **${data.name}** by **${data.artist}**!`);
			}
			return msg.reply(`Nice! It's **${data.name}** by **${data.artist}**!`);
		} catch (err) {
			this.client.dispatchers.delete(msg.guild.id);
			this.client.games.delete(msg.channel.id);
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Song ID: \`${songID}\`.`);
		}
	}

	async fetchCharts(playlist) {
		if (this.charts.has(playlist)) return this.charts.get(playlist);
		const { body } = await request
			.get('https://spotifycharts.com/regional/us/daily/latest/download')
			.set({ Authorization: `Bearer ${this.token}` })
			.query({
				market: 'US',
				fields: 'items(track(id))',
				limit: 100
			});
		const list = body.items.map(item => item.track.id);
		this.charts.set(playlist, list);
		setTimeout(() => this.charts.delete(playlist), 4.32e+7);
		return list;
	}

	async fetchRandomSong(playlist) {
		const songs = await this.fetchCharts(playlist);
		const choice = songs[Math.floor(Math.random() * songs.length)];
		return this.fetchSongPreview(choice);
	}

	async fetchSongPreview(id) {
		if (this.cache.has(id)) return this.cache.get(id);
		const { body } = await request
			.get(`https://api.spotify.com/v1/tracks/${id}`)
			.set({ Authorization: `Bearer ${this.token}` })
			.query({ market: 'US' });
		let previewURL = body.preview_url;
		if (!body.preview_url) previewURL = await this.fetchAlternativePreview(id);
		const result = {
			id,
			name: body.name,
			artist: list(body.artists.map(artist => artist.name)),
			preview: previewURL
		};
		this.cache.set(id, result);
		return result;
	}

	async fetchAlternativePreview(id) {
		const { text } = await request.get(`https://open.spotify.com/embed/track/${id}`);
		const $ = cheerio.load(text);
		return JSON.parse(decodeURIComponent($('script[id="resource"]')[0].children[0].data)).preview_url;
	}

	async fetchToken() {
		const { body } = await request
			.post('https://accounts.spotify.com/api/token')
			.set({
				Authorization: `Basic ${base64(`${SPOTIFY_KEY}:${SPOTIFY_SECRET}`)}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			})
			.send('grant_type=client_credentials');
		this.token = body.access_token;
		setTimeout(() => { this.token = null; }, body.expires_in * 1000);
		return body;
	}
};
