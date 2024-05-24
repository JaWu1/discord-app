const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Your inventory displayed'),
	async execute(interaction, profileData) {
		const username = interaction.user.username;
		const { inventory } = profileData;

		const embed = new EmbedBuilder()
			.setColor(0x800080)
			.setTitle(`${username}'s Inventory`)
			.setDescription('All the items you own');

		for (const i of inventory) {
			embed.addFields(
				{ name: `${i.emoji} ${i.name}`, value: `- ${i.quantity}` },
			);
		}
		await interaction.reply({ embeds: [embed] });
	},
};

