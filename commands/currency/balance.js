const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Shows the user their balance'),
	async execute(interaction, profileData) {
		const { balance } = profileData;
		const username = interaction.user.username;

		const embed = new EmbedBuilder()
			.setTitle(`${username}'s balance`)
			.setColor(0x800080)
			.setDescription(`:coin:  ${balance} coins`)

		await interaction.reply({ embeds: [embed] });
	},
};

