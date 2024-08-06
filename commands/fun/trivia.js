const { SlashCommandBuilder } = require('discord.js');
const { Trivia } = require('discord-gamecord');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('Answer trivia questions'),
	async execute(interaction) {
        const difficulty = getRandomDifficulty();
		const winMessage = getWinMessage(difficulty);

		const Game = new Trivia({
            message: interaction,
            isSlashGame: true,
            embed: {
              title: 'Trivia',
              color: '#5865F2',
              description: 'You have 60 seconds to guess the answer.'
            },
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            trueButtonStyle: 'SUCCESS',
            falseButtonStyle: 'DANGER',
            mode: 'multiple',  // multiple || single
            difficulty: difficulty,  // easy || medium || hard
			winMessage: winMessage,
            loseMessage: 'Incorrect! The correct answer is {answer}.',
            errMessage: 'Unable to fetch question data! Please try again.',
            playerOnlyMessage: 'Only {player} can use these buttons.'
        });
          
        Game.startGame();
        Game.on('gameOver', result => {
            return;  // =>  { result... }
        });

		//await interaction.reply({ embeds: [embed] });
	},
};

function getRandomDifficulty() {
	const difficulties = ['easy', 'medium', 'hard'];
	return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function getWinMessage(difficulty) {
	switch (difficulty) {
		case 'easy':
			return 'Correct! You win 10 coins.';
		case 'medium':
			return 'Correct! You win 25 coins.';
		case 'hard':
			return 'Correct! You win 100 coins.';
		default:
			return 'Correct!';
	}
}