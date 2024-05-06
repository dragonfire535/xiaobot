const Argument = require('../framework/ArgumentType');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const request = require('node-superfetch');
const validURL = require('valid-url');

module.exports = class ImageArgument extends Argument {
	constructor(client) {
		super(client, 'image');
	}

	async validate(value, msg) {
		const attachment = msg.attachments.first();
		if (attachment) {
			if (attachment.size > 8e+6) return 'Image size is above 8 MB.';
			if (!fileTypeRe.test(attachment.name)) return 'Provided attachment is not an image.';
			return true;
		}
		if (fileTypeRe.test(value.toLowerCase())) {
			if (!validURL.isWebUri(value)) return 'Provided URL is not valid.';
			try {
				await request.get(value);
				return true;
			} catch {
				return 'Provided URL is not valid.';
			}
		}
		return false;
	}

	parse(value, msg) {
		const attachment = msg.attachments.first();
		if (attachment) return attachment.url;
		if (fileTypeRe.test(value.toLowerCase())) return value;
		return null;
	}

	isEmpty(value, msg) {
		if (msg.attachments.size) return false;
		return !value;
	}
};
