const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const parseMilliseconds = require('parse-ms-2');
const profileModel = require('../../models/profileSchema');
const { dailyMin, dailyMax } = require('../../globalValues.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Redeem daily free coins'),
	async execute(interaction, profileData) {
		const { id } = interaction.user;
		const { dailyLastUsed } = profileData;

		const cooldown = 86400000;
		const timeLeft = cooldown - (Date.now() - dailyLastUsed);

		if (timeLeft > 0) {
			await interaction.deferReply({ ephemeral: true });
			const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
			await interaction.editReply(`Claim your next daily in ${hours} hrs ${minutes} min ${seconds} sec`);
		}
		else {
			const randomAmt = Math.floor(
				Math.random() * (dailyMax - dailyMin + 1) + dailyMin,
			);

			try {
				await profileModel.findOneAndUpdate({ userId: id }, { $set: { dailyLastUsed: Date.now() }, $inc: { balance: randomAmt } });
			}
			catch (err) {
				console.log(err);
			}

			const embed = new EmbedBuilder()
				.setTitle(`Daily coins`)
				.setColor(0x0099FF)
				.setDescription(`You redeemed ${randomAmt} coins!`)

			await interaction.reply({ embeds: [embed] });
		}
	},
};

