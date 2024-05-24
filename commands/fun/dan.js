const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const arr = [
	'dantheman xi huan xiao hai zi',
	'danthe black man',
	'just (dan)ce',
	'i want to d leate myself',
	'dansexual',
];

const emojis = [
	' <:pog:1189161134771666975>',
	' <:women:1189160949760938064>',
	' <:omae_wa_mou:1189160690385162240>'
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dan')
		.setDescription('Replies with random dan!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x33A6D4)
			.setDescription(arr[Math.floor(Math.random() * arr.length)] + emojis[Math.floor(Math.random() * emojis.length)]);

		await interaction.reply({ embeds: [embed] });
	},
};
