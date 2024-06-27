const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const lootBankModel = require('../../models/lootBankSchema');
const profileModel = require('../../models/profileSchema');
const parseMilliseconds = require('parse-ms-2');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loot')
		.setDescription('Try to loot from coinbank, you may lose 500 coins'),
	async execute(interaction, profileData) {
        const { username, id } = interaction.user;
        const { balance } = profileData;

        const lootBankFind = await lootBankModel.findOne({});

        const cooldown = 10 * 60 * 1000; // 10 minutes in milliseconds
        const now = Date.now();
        const timeLeft = cooldown - (now - lootBankFind.lootLastUsed);

        if (timeLeft > 0) {
            const { minutes, seconds } = parseMilliseconds(timeLeft);
            await interaction.reply({ content: `Loot again in ${minutes} min ${seconds} sec`, ephemeral: true });
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
        
        if (coinsAmt < 500) {
            lootedCoins = -500;
            coinsAmt -= lootedCoins;
            outcome = `:empty_nest: ${username} lost 500 coins from failed loot`;
        }
        else if (random < 0.02) {
            // 2% chance to take 100%
            lootedCoins = coinsAmt;
            coinsAmt = 0;
            outcome = `:money_mouth: ${username} looted ALL ${lootedCoins} coins from the bank!`;
        } else if (random < 0.12) {
            // 10% chance to take 30%
            lootedCoins = Math.floor(coinsAmt * 0.30);
            coinsAmt -= lootedCoins;
            outcome = `:moneybag: ${username} looted ${lootedCoins} coins from the bank!`;
        } else if (random < 0.35) {
            // 23% chance to take 15%
            lootedCoins = Math.floor(coinsAmt * 0.15);
            coinsAmt -= lootedCoins;
            outcome = `:money_with_wings: ${username} looted ${lootedCoins} coins from the bank!`;
        } else {
            // 65% chance to lose 500
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
            {$set: { lootLastUsed: Date.now() }},
        );

        await lootBankModel.findOneAndUpdate(
            {$set: { lootLastUsed: Date.now() }},
        )

        const embed = new EmbedBuilder()
            .setTitle(`Looting...`)
            .setColor(0x00AA6D)
            .setDescription(outcome);

		await interaction.reply({ embeds: [embed] });
	},
};