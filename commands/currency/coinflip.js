const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
// const { coinflipReward } = require('../../globalValues.json');
const profileModel = require('../../models/profileSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Flip a coin for chance to win x1.5')
		.addStringOption((option) => option
			.setName('choice')
			.setDescription('heads or tails')
			.setRequired(true)
			.addChoices({ name: 'Heads', value: 'Heads' }, { name: 'Tails', value: 'Tails' }))
		.addIntegerOption(option =>
			option.setName('amount').setDescription('Amount of coins to give').setRequired(true).setMinValue(1)),
	async execute(interaction, profileData) {
		const { id } = interaction.user;
		const betAmt = interaction.options.getInteger('amount');
		const { balance } = profileData;

		if (balance < betAmt) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`You do not have ${betAmt} coins in your balance`);
		}

		const randomNum = Math.round(Math.random());
		const result = randomNum ? 'Heads' : 'Tails';
		const choice = interaction.options.getString('choice');

		if (choice === result) {
			await profileModel.findOneAndUpdate(
				{ userId: id },
				{ $inc: { balance: (Math.round(0.5 * betAmt)) } },
			);

			const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(`Coinflipping...`)
				.setDescription(`✅ Winner! You won ${(Math.round(0.5 * betAmt))} coins with ${choice}`)
				.setFooter({ text: '**Multiplier: [1.5]x**'});

			await interaction.reply({ embeds: [embed] });
		}
		else {
			await profileModel.findOneAndUpdate(
				{ userId: id },
				{ $inc: { balance: -betAmt } },
			);

			const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(`Coinflipping...`)
				.setDescription(`❌ Lost... You chose ${choice} and lost ${betAmt}`)
				.setFooter({ text: 'Multiplier: 1.5x'});

			await interaction.reply({ embeds: [embed] });
		}
	},
};

