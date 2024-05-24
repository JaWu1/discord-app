const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const lootBankModel = require('../../models/lootBankSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinbank')
		.setDescription('Displays coin bank balance from losses during three-doors bets'),
	async execute(interaction) {
        let lootBank = await lootBankModel.findOne({});
        let coinsAmt = lootBank ? lootBank.bankBalance : 0;

        const embed = new EmbedBuilder()
            .setTitle(`Coin Bank Balance`)
            .setColor(0x0099FF)
            .setDescription(`Currently has 🪙 **${coinsAmt}** coins`)
            .setFooter({ text: 'Do /loot to try take some' })
            .setImage('https://cdn.discordapp.com/attachments/1189154932000038912/1241618181932449853/Screenshot_2024-05-19_at_3.03.57_pm.png?ex=664ada8a&is=6649890a&hm=d675949301b4702768c1638bc4609e25b7cf77d50da436d17e2576e32803bc8a&')

		await interaction.reply({ embeds: [embed] });
	},
};