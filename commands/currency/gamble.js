const { SlashCommandBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');
const lootBankModel = require('../../models/lootBankSchema');

// At the top of your file, define a Set to store users who are currently gambling
const usersInGambling = new Set();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamble')
		.setDescription('Gamble with coins')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('three-doors')
				.setDescription('Can triple, half or lose all coins')
				.addIntegerOption((option) => option
					.setName('amount')
					.setDescription('Choose amount of coins')
					.setMinValue(2)
					.setRequired(true),
				),
		),
	async execute(interaction, profileData) {
		const { username, id } = interaction.user;
		const { balance } = profileData;

		const gambleCommand = interaction.options.getSubcommand();
		const gambleEmbed = new EmbedBuilder().setColor(0x00aa6d);

		// Inside the execute function, before processing the command
		if (usersInGambling.has(interaction.user.id)) {
			await interaction.deferReply({ ephemeral: true });
			return await interaction.editReply("You're already in a gambling round. Finish your current round before starting another one.");
		}
		usersInGambling.add(interaction.user.id);
		

		// SubCommand - gamble game three doors
		if (gambleCommand == 'three-doors') {
			const amount = interaction.options.getInteger('amount');

			if (balance < amount) {
				usersInGambling.delete(interaction.user.id);
				await interaction.deferReply({ ephemeral: true });
				return await interaction.editReply(`You do not have ${amount} coins in your balance`);
			}

			await interaction.deferReply();

			const Button1 = new ButtonBuilder()
				.setCustomId('one')
				.setLabel('Door 1')
				.setStyle(ButtonStyle.Primary);

			const Button2 = new ButtonBuilder()
				.setCustomId('two')
				.setLabel('Door 2')
				.setStyle(ButtonStyle.Primary);

			const Button3 = new ButtonBuilder()
				.setCustomId('three')
				.setLabel('Door 3')
				.setStyle(ButtonStyle.Primary);

			const row = new ActionRowBuilder().addComponents(Button1, Button2, Button3);

			gambleEmbed
				.setTitle(`Playing three doors for ${amount} coins`)
				.setFooter({ text: 'Each door has DOUBLE COINS, LOSE HALF, LOSE ALL' });

			await interaction.editReply({ embeds: [gambleEmbed], components: [row] });

			// gather message we just sent ^^
			const message = await interaction.fetchReply();

			const filter = (i) => i.user.id === interaction.user.id;

			const collector = message.createMessageComponentCollector({
				filter,
				time: 60000,
			});

			collector.on('end', (collected, reason) => {
				if (reason === 'time') {
					// If collector times out, remove the user from the Set
					usersInGambling.delete(interaction.user.id);
				}
			});

			const double = 'DOUBLE COINS';
			const half = 'LOSE HALF';
			const lose = 'LOSE ALL';

			const getAmount = (label, gamble) => {
				let value = -gamble;
				if (label === double) {
					value = gamble;
				}
				else if (label == half) {
					value = -Math.round(gamble / 2);
				}
				return value;
			};

			let choice = null;

			collector.on('collect', async (i) => {
				const options = [Button1, Button2, Button3];

				const randIdxDouble = Math.floor(Math.random() * 3);
				const doubleButton = options.splice(randIdxDouble, 1)[0];
				doubleButton.setLabel(double).setDisabled(true);

				const randomIdxHalf = Math.floor(Math.random() * 2);
				const halfButton = options.splice(randomIdxHalf, 1)[0];
				halfButton.setLabel(half).setDisabled(true);

				const zeroButton = options[0];
				zeroButton.setLabel(lose).setDisabled(true);

				Button1.setStyle(ButtonStyle.Secondary);
				Button2.setStyle(ButtonStyle.Secondary);
				Button3.setStyle(ButtonStyle.Secondary);

				if (i.customId === 'one') choice = Button1;
				else if (i.customId === 'two') choice = Button2;
				else if (i.customId === 'three') choice = Button3;

				choice.setStyle(ButtonStyle.Success);
				const label = choice.data.label;
				const amtChange = getAmount(label, amount);

				await profileModel.findOneAndUpdate(
					{ userId: id },
					{ $inc: { balance: amtChange } },
				);

				if (amtChange < 0) {
					// if you lose, its put in a bank
                    await lootBankModel.findOneAndUpdate(
						{},
                        { $inc: { bankBalance: Math.abs(amtChange/2) } },
                        { upsert: true, new: true }
                    );
                }

				if (label === double) {
					gambleEmbed
						.setTitle('DOUBLED! You just doubled your gamble')
						.setFooter({ text: `${username} gained ${amtChange} coins` });
				}
				else if (label === half) {
					gambleEmbed
						.setTitle('Well.. You just lost half your gamble')
						.setFooter({ text: `${username} lost ${amtChange} coins` });
				}
				else if (label === lose) {
					gambleEmbed
						.setTitle('Oh.. You just lost all your gamble')
						.setFooter({ text: `${username} lost ${amtChange} coins` });
				}

				await i.update({ embeds: [gambleEmbed], components: [row] });
				collector.stop();

				// Remove the user from the Set to mark the end of the gambling round (as it is in collector)
				usersInGambling.delete(interaction.user.id);
			});
		}

	},
};

