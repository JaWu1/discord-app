const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const items = require('./items.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shoplist')
		.setDescription('Shows items in the shop you can buy!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('__Shop__')
			.setDescription('Items availible for purchase');

		for (const i of items) {
			embed.addFields(
				{ name: `${i.emoji}  ${i.item}`, value: `${numberWithCommas(i.price)} coins` },
			);
		}
		await interaction.reply({ embeds: [embed] });
	},
};

// Helper function to format commas in numbers
function numberWithCommas(number) {
	const parts = number.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}