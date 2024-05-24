const { SlashCommandBuilder, ButtonStyle} = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');

const usersInDice = new Set();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Bet using dice against another player')
        .addUserOption(option =>
			option.setName('target').setDescription('The user to battle').setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount').setDescription('Coins to dice battle').setRequired(true).setMinValue(2)),
	async execute(interaction, profileData) {
		const username = interaction.user.username;

        const targetUser = interaction.options.getUser('target');
		const betAmt = interaction.options.getInteger('amount');

        // Case cannot battle yourself
        if (interaction.user.id === targetUser.id) {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply('You cannot battle yourself!');
        }

        // Case balance < amt
        const { balance } = profileData;
		if (balance < betAmt) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`You do not have ${betAmt} coins in your balance`);
		}

        // Case their balance < amt OR (user does not exist in database)
		let profileD = await profileModel.findOne({ userId: targetUser.id });
		if (!profileD) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`${targetUser.username} is not in currency system`);
		}
		else if (profileD.balance < betAmt) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply(`${targetUser.username} does not have ${betAmt} coins to bet`);
		}

		// Add users into dice 
		if (usersInDice.has(interaction.user.id) || usersInDice.has(targetUser.id)) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply("You either started or got tagged in a dice round, finish before starting a new one.");
		}
		usersInDice.add(interaction.user.id, targetUser.id);

		// want to return 2 or 3 embedds
		const Button1 = new ButtonBuilder()
			.setCustomId('one')
			.setLabel('Accept')
			.setStyle(ButtonStyle.Primary);

		const Button2 = new ButtonBuilder()
			.setCustomId('two')
			.setLabel('Decline')
			.setStyle(ButtonStyle.Primary);
			
		const buttonRow = new ActionRowBuilder().addComponents(Button1, Button2);

		const embed = new EmbedBuilder()
			.setTitle(`Dice Battle !`)
			.setColor(0x00aa6d)
			.setDescription(`${interaction.user} has wagered :coin: ${betAmt} coins against ${targetUser}`)

		await interaction.reply({ embeds: [embed], components: [buttonRow] });

		// Get interaction response 3 minutes
		const message = await interaction.fetchReply();
		const filter = (i) => i.user.id === targetUser.id;

		const collector = message.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on('end', (collected, reason) => {
			if (reason === 'time') {
				usersInDice.delete(interaction.user.id, targetUser.id);
			}
		});

		let choice = null;
		const embedResult = new EmbedBuilder()
			.setTitle(`Result:`)
			.setColor(0x00aa6d);
		let result = '';
		collector.on('collect', async (i) => {
			Button1.setStyle(ButtonStyle.Secondary).setDisabled(true);
			Button2.setStyle(ButtonStyle.Secondary).setDisabled(true);

			if (i.customId === 'one') {
				choice = Button1;
				choice.setStyle(ButtonStyle.Success).setLabel('Accepted')

				const p1Roll = Math.floor(Math.random() * blackDie.length) + 1;
				const p2Roll = Math.floor(Math.random() * redDie.length) + 1;

				embed.addFields(
					{ name: '\u200A', value: '\u200A' },
					{ name: `${username} rolls a:`, value: `\🎲 **${p1Roll}**`, inline: true },
					{ name: `${targetUser.username} rolls a:`, value: `🎲 **${p2Roll}**`, inline: true },
				)

				if (p1Roll == p2Roll) {
					embedResult.setDescription('Tie: You both gain 0 coins');
				} else if (p1Roll > p2Roll) {
					embedResult
						.setDescription(`${interaction.user} has won :coin: ${betAmt}`)
						.setFooter({ text: `${targetUser.username} lost ${betAmt}`});
					
					await profileModel.findOneAndUpdate(
						{ userId: interaction.user.id },
						{ $inc: { balance: betAmt } },
					);
					await profileModel.findOneAndUpdate(
						{ userId: targetUser.id },
						{ $inc: { balance: -betAmt } },
					);
				} else if (p1Roll < p2Roll) {
					embedResult
						.setDescription(`${targetUser} has won :coin: ${betAmt}`)
						.setFooter({ text: `${interaction.user.username} lost ${betAmt}`});;
				
					await profileModel.findOneAndUpdate(
						{ userId: interaction.user.id },
						{ $inc: { balance: -betAmt } },
					);
					await profileModel.findOneAndUpdate(
						{ userId: targetUser.id },
						{ $inc: { balance: betAmt } },
					);
				}
			}
			else if (i.customId === 'two') {
				choice = Button2;
				choice.setStyle(ButtonStyle.Danger).setLabel('Declined');
				usersInDice.delete(interaction.user.id, targetUser.id);
				await i.update({ embeds: [embed], components: [buttonRow] });
				return;
			}

			await i.update({ embeds: [embed, embedResult], components: [buttonRow] });
			collector.stop();

			usersInDice.delete(interaction.user.id, targetUser.id);
		});
	},
};

// Dice below
const blackDie = [1, 2, 3, 4, 5, 6];
const redDie = [1, 2, 3, 4, 5, 6];


