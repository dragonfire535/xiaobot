const Command = require('../../framework/Command');
const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const path = require('path');

module.exports = class SkyrimSkillCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'skyrim-skill',
			aliases: ['skyrim-level', 'skyrim'],
			group: 'edit-meme',
			memberName: 'skyrim-skill',
			description: 'Sends a "Skyrim Skill" meme with the skill and image of your choice.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			credit: [
				{
					name: 'Bethesda',
					url: 'https://bethesda.net/en/dashboard',
					reason: 'Image, Original "The Elder Scrolls V: Skyrim" Game',
					reasonURL: 'https://elderscrolls.bethesda.net/en/skyrim'
				},
				{
					name: 'Fontsgeek',
					url: 'http://fontsgeek.com/',
					reason: 'Futura Condensed Font',
					reasonURL: 'http://fontsgeek.com/fonts/Futura-Condensed-Regular'
				}
			],
			args: [
				{
					key: 'skill',
					type: 'string',
					max: 20,
					parse: skill => skill.toUpperCase()
				},
				{
					key: 'image',
					type: 'image-or-avatar',
					default: msg => msg.author.displayAvatarURL({ format: 'png', size: 2048 })
				}
			]
		});
	}

	async run(msg, { skill, image }) {
		const { body } = await request.get(image);
		const base = await loadImage(body);
		const plate = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'skyrim-skill.png'));
		const scaleH = plate.width / base.width;
		const height = Math.round(base.height * scaleH);
		const canvas = createCanvas(plate.width, plate.height + height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0, plate.width, height);
		ctx.drawImage(plate, 0, height + 1);
		ctx.font = this.client.fonts.get('Futura Condensed.ttf').toCanvasString(77);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'black';
		ctx.fillText(skill, 189 + 5, height + 75 + 3, 300);
		ctx.fillStyle = 'white';
		ctx.fillText(skill, 189, height + 75, 300);
		const attachment = canvas.toBuffer();
		if (Buffer.byteLength(attachment) > 8e+6) return msg.reply('Resulting image was above 8 MB.');
		return msg.say({ files: [{ attachment, name: 'skyrim-skill.png' }] });
	}
};
