const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const request = require('node-superfetch');
const path = require('path');
const { streamToArray } = require('../../util/Util');
const { drawImageWithTint } = require('../../util/Canvas');
const frameCount = 46;

module.exports = class FireCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fire',
			aliases: ['hell', 'burn', 'flames'],
			group: 'edit-avatar',
			memberName: 'fire',
			description: 'Burns a user\'s avatar.',
			throttling: {
				usages: 2,
				duration: 30
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'LowGif',
					url: 'http://www.lowgif.com/',
					reason: 'Images',
					reasonURL: 'http://www.lowgif.com/43360ebce9150f23.html'
				}
			],
			args: [
				{
					key: 'user',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}

	async run(msg, { user }) {
		const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
		const { body } = await request.get(avatarURL);
		const avatar = await loadImage(body);
		const encoder = new GIFEncoder(avatar.width, avatar.height);
		const canvas = createCanvas(avatar.width, avatar.height);
		const ctx = canvas.getContext('2d');
		const stream = encoder.createReadStream();
		encoder.start();
		encoder.setRepeat(0);
		encoder.setDelay(0);
		encoder.setQuality(100);
		for (let i = 0; i < frameCount; i++) {
			const frame = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'fire', `frame-${i}.gif`));
			const ratio = frame.width / frame.height;
			const height = Math.round(avatar.width / ratio);
			drawImageWithTint(ctx, avatar, '#fc671e', 0, 0, avatar.width, avatar.height);
			ctx.drawImage(frame, 0, avatar.height - height, avatar.width, height);
			encoder.addFrame(ctx);
		}
		encoder.finish();
		const buffer = await streamToArray(stream);
		return msg.say({ files: [{ attachment: Buffer.concat(buffer), name: 'fire.gif' }] });
	}
};
