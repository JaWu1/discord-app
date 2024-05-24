const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const arr = [
	'It is certain',
	'Without a doubt',
	'You may rely on it',
	'Yes definitely',
	'It is decidedly so',
	'As I see it, yes',
	'Most likely',
	'Yes',
	'Outlook good',
	'Signs point to yes',

	'Reply hazy try again',
	'Better not tell you now',
	'Ask again later',
	'Cannot predict now',
	'Concentrate and ask again',

	'Don’t count on it',
	'Outlook not so good',
	'My sources say no',
	'Very doubtful',
	'My reply is no',
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Replies with 8ball responses!')
		.addStringOption(option => option.setName('message').setDescription('Message to 8ball').setRequired(true)),
	async execute(interaction) {
		const message = interaction.options.getString('message');
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Magic 8ball')
			.setThumbnail('https://i.imgur.com/X3WtFGI.png')
			.addFields(
				{ name: 'Message:', value: `${message}` },
				{ name: 'Response:', value: `${arr[Math.floor(Math.random() * arr.length)]}` },
			);
		await interaction.reply({ embeds: [exampleEmbed] });
	},
};
