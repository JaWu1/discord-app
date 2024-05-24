const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const profileModel = require('../../models/profileSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows Top 10 Coin Earners'),
	async execute(interaction, profileData) {
		await interaction.deferReply();

		const { username, id } = interaction.user;
		const { balance } = profileData;

		const leaderboardEmbed = new EmbedBuilder()
			.setTitle('**Top 10 Coin Earners**')
			.setColor(0x0099FF)
			.setFooter({ text: 'You are not ranked yet' });

		const members = await profileModel.find().sort({ balance: -1 })
			.catch((err) => console.log(err));

		const memberIdx = members.findIndex((member) => member.userId === id);

		leaderboardEmbed.setFooter({ text: `${username}, you're rank #${memberIdx + 1} with ${balance}` });

		const topTen = members.slice(0, 10);

		let desc = '';
		for (let i = 0; i < topTen.length; i++) {
			try {
				const user = await interaction.client.users.fetch(topTen[i].userId);
				if (user) {
					const userBalance = topTen[i].balance;
					desc += `**${i + 1}. ${user.username} -** ${userBalance} coins\n`;
				}
			} catch (error) {
				console.error(`Error fetching user with ID ${topTen[i].userId}:`, error);
			}
		}
		if (desc !== '') {
			leaderboardEmbed.setDescription(desc);
		}

		await interaction.editReply({ embeds: [ leaderboardEmbed ] });


	},
};

