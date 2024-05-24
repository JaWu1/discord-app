const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const profileModel = require('../../models/profileSchema');
const shopItems = require('./items.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy an item from the shop')
		.addStringOption((option) =>
			option.setName('itemchose')
				.setDescription('Item to purchase')
				.setRequired(true)),
	async execute(interaction, profileData) {
		const { id } = interaction.user;
		const itemChose = interaction.options.getString('itemchose').toLowerCase().replace(/[^a-zA-Z]/g, '');
		const { balance, inventory } = profileData;

		// Item is an object
		const item = shopItems.find((i) => i.item.toLowerCase().replace(/[^a-zA-Z]/g, '') == itemChose);

		if (!item) {
			const embed1 = new EmbedBuilder()
				.setColor(0x0099FF)
				.setDescription('Item not found in shop')
			await interaction.reply({ embeds: [embed1] });
			return;
		}

		if (balance < item.price) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`You do not have ${item.price} coins to buy this`);
		}

		const existingItem = inventory.find((i) => i.name.toLowerCase() === item.item.toLowerCase());

		if (existingItem) {
			existingItem.quantity += 1;
		}
		else {
			inventory.push({ emoji: item.emoji, name: item.item, quantity: 1 });
		}

		await profileModel.findOneAndUpdate(
			{ userId: id },
			{
				$inc: { balance: -item.price },
				inventory: inventory,
			},
		);

		const embed2 = new EmbedBuilder()
				.setColor(0x0099FF)
				.setDescription(`You bought a ${item.item} for ${item.price}`)

		await interaction.reply({ embeds: [embed2] });
	},
};

