const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Learn how to get started with currency commands!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Help & Commands')
			.setDescription('Welcome, to get started use /balance to see your starting coins.\
                You can gamble with your coins and save up to buy items. Also report any bugs or issues to jawu.')
			.addFields({ name: '__Currency Commands__ 🪙', value: '**/balance** \nShows your total coin balance\n\
                \n**/daily** \n Claim your daily coins from range of 100-200 coins\n\
                \n**/give** \n Gives any amount of coins to someone else, deducts it from your balance\n\
                \n**/leaderboard** \n Views the top 10 coin earners as well as your ranking on the board\n\
                \n**/coinflip** \n Flip a coin (heads or tails) and win 1.5x multiplier on amount bet\n\
                \n**/gamble** \n Pick a door, 1 door will double your coins, one will lose half and one will lose all your coins\n' })
			.addFields({ name: '__Shop Commands__ 🏬', value: '**/shopList** \n Shows what you can buy with coins\n\
                \n**/buy** \n Buy an item with your coins\n\
                \n**/inventory** \n View your inventory of items' });

		await interaction.reply({ embeds: [embed] });
	},
};

