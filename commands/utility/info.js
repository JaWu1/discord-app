const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const profileModel = require('../../models/profileSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get info about a user or a server!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
	async execute(interaction, profileData) {

		if (interaction.options.getSubcommand() === 'user') {
			const targetUser = interaction.options.getUser('target') || interaction.user;
			const member = await interaction.guild.members.fetch(targetUser.id);
			let profileD = await profileModel.findOne({ userId: targetUser.id });

			if (!profileD) {
				await interaction.deferReply({ ephemeral: true });
				return await interaction.editReply(`${targetUser.username} is not in currency system`);
			}
	
			const embed1 = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('User Information')
				.setThumbnail(targetUser.displayAvatarURL())
				.addFields(
					{ name: 'User:', value: targetUser.username },
					{ name: 'Join Date:', value: new Date(member.joinedTimestamp).toLocaleString() },
					{ name: 'Honkai Star Rail:', value: `4-star pity = ${profileD.star4}\n5-star pity = ${profileD.star5}\nGuaranteed banner = ${profileD.guaranteedBanner}` },
				);
			await interaction.reply({ embeds: [embed1] });
		}
		else if (interaction.options.getSubcommand() === 'server') {
			const embed2 = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Server Information')
			.setThumbnail(`${interaction.guild.iconURL()}`)
			.addFields(
				{ name: 'Server:', value: `${interaction.guild.name}` },
				{ name: 'Members:', value:  `${interaction.guild.memberCount}` },
			);
			await interaction.reply({ embeds: [embed2] });
		}
	},
};