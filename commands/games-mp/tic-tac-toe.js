const Command = require('../../framework/Command');
const { default: { ComputerMove } } = require('tictactoe-minimax-ai');
const { stripIndents } = require('common-tags');
const { verify } = require('../../util/Util');
const nums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
const valid = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

module.exports = class TicTacToeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tic-tac-toe',
			aliases: ['ttt', 'tic-tac'],
			group: 'games-mp',
			description: 'Play a game of tic-tac-toe with another user or the AI.',
			game: true,
			args: [
				{
					key: 'opponent',
					type: 'user'
				}
			]
		});
	}

	async run(msg, { opponent }) {
		if (opponent.id === msg.author.id) return msg.reply('You may not play against yourself.');
		if (this.client.blacklist.user.includes(opponent.id)) return msg.reply('This user is blacklisted.');
		if (!opponent.bot) {
			await msg.say(`${opponent}, do you accept this challenge?`);
			const verification = await verify(msg.channel, opponent);
			if (!verification) return msg.say('Looks like they declined...');
		}
		const sides = [0, 1, 2, 3, 4, 5, 6, 7, 8];
		const taken = [];
		let userTurn = true;
		let winner = null;
		let lastTurnTimeout = false;
		while (!winner && taken.length < 9) {
			const user = userTurn ? msg.author : opponent;
			const sign = userTurn ? 'X' : 'O';
			let choice;
			if (opponent.bot && !userTurn) {
				// eslint-disable-next-line new-cap
				choice = ComputerMove(sides, { aiPlayer: 'O', huPlayer: 'X' }, 'Hard');
			} else {
				await msg.say(stripIndents`
					${user}, which side do you pick? Type \`end\` to forfeit.

					${this.displayBoard(sides)}
				`);
				const filter = res => {
					if (res.author.id !== user.id) return false;
					const pick = res.content;
					if (pick.toLowerCase() === 'end') return true;
					return valid.includes(pick) && !taken.includes(pick);
				};
				const turn = await msg.channel.awaitMessages({
					filter,
					max: 1,
					time: 30000
				});
				if (!turn.size) {
					await msg.say('Sorry, time is up!');
					if (lastTurnTimeout) {
						winner = 'time';
						break;
					} else {
						userTurn = !userTurn;
						lastTurnTimeout = true;
						continue;
					}
				}
				choice = turn.first().content;
				if (choice.toLowerCase() === 'end') {
					winner = userTurn ? opponent : msg.author;
					break;
				}
			}
			sides[opponent.bot && !userTurn ? choice : Number.parseInt(choice, 10) - 1] = sign;
			taken.push(choice);
			const win = this.verifyWin(sides, msg.author, opponent);
			if (taken.length === 9 && !win) winner = 'tie';
			if (win) winner = win;
			if (lastTurnTimeout) lastTurnTimeout = false;
			userTurn = !userTurn;
		}
		if (winner === 'time') return msg.say('Game ended due to inactivity.');
		return msg.say(stripIndents`
			${winner === 'tie' ? 'Oh... The cat won.' : `Congrats, ${winner}!`}

			${this.displayBoard(sides)}
		`);
	}

	playerWon(board, player) {
		if (
			(board[0] === player && board[1] === player && board[2] === player)
			|| (board[3] === player && board[4] === player && board[5] === player)
			|| (board[6] === player && board[7] === player && board[8] === player)
			|| (board[0] === player && board[3] === player && board[6] === player)
			|| (board[1] === player && board[4] === player && board[7] === player)
			|| (board[2] === player && board[5] === player && board[8] === player)
			|| (board[0] === player && board[4] === player && board[8] === player)
			|| (board[2] === player && board[4] === player && board[6] === player)
		) return true;
		return false;
	}

	verifyWin(board, player1, player2) {
		if (this.playerWon(board, 'X')) return player1;
		if (this.playerWon(board, 'O')) return player2;
		return null;
	}

	displayBoard(board) {
		let str = '';
		for (let i = 0; i < board.length; i++) {
			if (board[i] === 'X') {
				str += '❌';
			} else if (board[i] === 'O') {
				str += '⭕';
			} else {
				str += nums[i];
			}
			if (i % 3 === 2) str += '\n';
		}
		return str;
	}
};
