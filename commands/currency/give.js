const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const profileModel = require('../../models/profileSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Gives your coins to another user')
		.addUserOption(option =>
			option.setName('target').setDescription('The user to give to').setRequired(true))
		.addIntegerOption(option =>
			option.setName('amount').setDescription('Amount of coins to give').setRequired(true).setMinValue(1)),
	async execute(interaction, profileData) {
		const receiveUser = interaction.options.getUser('target');
		const donateAmt = interaction.options.getInteger('amount');

		const { balance } = profileData;

		if (balance < donateAmt) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`You do not have ${donateAmt} coins in your balance`);
		}

		const receiveUserData = await profileModel.findOneAndUpdate(
			{ userId: receiveUser.id },
			{
				$inc: {
					balance: donateAmt,
				},
			},
		);

		if (!receiveUserData) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`${receiveUser.username} is not in currency system`);
		}

		await interaction.deferReply();

		await profileModel.findOneAndUpdate(
			{ userId: interaction.user.id },
			{ $inc: { balance: -donateAmt } },
		);

		const embed = new EmbedBuilder()
				.setTitle(`Giving Coins...`)
				.setColor(0x0099FF)
				.setDescription(`You have donated ${donateAmt} coins to ${receiveUser.username} `)

		interaction.editReply({ embeds: [embed] });

	},
};

