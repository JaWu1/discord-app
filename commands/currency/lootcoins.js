const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const lootBankModel = require('../../models/lootBankSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Try to loot from coinbank, you may lose 500 coins'),
	async execute(interaction, profileData) {
        const { username, id } = interaction.user;
        const { balance, lootLastUsed } = profileData;

		const cooldown = 60000;
		const timeLeft = cooldown - (Date.now() - lootLastUsed);

        if (timeLeft > 0) {
			await interaction.deferReply({ ephemeral: true });
			const { minutes, seconds } = parseMilliseconds(timeLeft);
			await interaction.editReply(`Loot again in ${minutes} min ${seconds} sec`);
            return;
		}

        if (balance < 500) {
            await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`You do not have 500 coins to loot this`);
        }

        let lootBank = await lootBankModel.findOne({});
        let coinsAmt = lootBank ? lootBank.bankBalance : 0;

        // Get the rates for looting
        const random = Math.random();
        let outcome;
        let lootedCoins = 0;

        if (random < 0.10) {
            // 10% chance to take 100%
            lootedCoins = coinsAmt;
            coinsAmt = 0;
            outcome = `:money_mouth: ${username} looted ALL ${lootedCoins} coins from the bank!`;
        } else if (random < 0.35) {
            // 25% chance to take 30%
            lootedCoins = Math.floor(coinsAmt * 0.30);
            coinsAmt -= lootedCoins;
            outcome = `:money_with_wings: ${username} looted ${lootedCoins} coins from the bank!`;
        } else if (random < 0.75) {
            // 40% chance to take 20%
            lootedCoins = Math.floor(coinsAmt * 0.20);
            coinsAmt -= lootedCoins;
            outcome = `:money_mouth: ${username} looted ${lootedCoins} coins from the bank!`;
        } else {
            // 25% lose
            lootedCoins = -500;
            coinsAmt -= lootedCoins;
            outcome = `:empty_nest: ${username} lost 500 coins from failed loot`;
        }

        if (lootBank) {
            lootBank.bankBalance = coinsAmt;
            await lootBank.save();
        }

        await profileModel.findOneAndUpdate(
            { userId: id },
            { $inc: { balance: lootedCoins } },
        );

        const embed = new EmbedBuilder()
            .setTitle(`Looting...`)
            .setColor(0x00AA6D)
            .setDescription(outcome);

		await interaction.reply({ embeds: [embed] });
	},
};