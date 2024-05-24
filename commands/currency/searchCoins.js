const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const parseMilliseconds = require('parse-ms-2');
const profileModel = require('../../models/profileSchema');


const arr1 = [
	'You touched some grass and earned',
	'You streamed on twitch and earned',
	'You found some coins at Kogarah library and earned',
	'You recycled some bottles and earned',
];

const arr2 = [
	'You worked at a bubble tea store for a day and earned',
	'You interned at riot games and earned',
	'Selling your walker got you',
	'You mowed your neighbor\'s lawn and earned',
];

const arr3 = [
	'You became Amazon CEO for a second, and got',
	'You won the lottery and earned',
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Find some coins'),
	async execute(interaction, profileData) {
		const { id } = interaction.user;
		const roll = Math.floor(Math.random() * 100);
		
		// Add in a 5 min reset duration;
		const { searchLastUsed } = profileData;
		const cooldown = 60000;
		const timeLeft = cooldown - (Date.now() - searchLastUsed);

		if (timeLeft > 0) {
			await interaction.deferReply({ ephemeral: true });
			const { minutes, seconds } = parseMilliseconds(timeLeft);
			await interaction.editReply(`Search again in ${minutes} min ${seconds} sec`);
		}
		else {
			const { msg, toAdd } = getroll(roll);

			await profileModel.findOneAndUpdate(
				{ userId: id },
				{ 
					$inc: { balance: toAdd }, 
					$set: { searchLastUsed: Date.now() },
				}
			);

			const embed = new EmbedBuilder()
				.setTitle(`Searching coins...`)
				.setColor(0x0099FF)
				.setDescription(`${msg} ${toAdd} coins`)

			await interaction.reply({ embeds: [embed] });
		}
	},
};

function getroll(roll) {
	let toAdd = 0;
	let msg = '';

	if (roll == 1) {
		msg = arr3[Math.floor(Math.random() * arr3.length)];
		toAdd = 1000;
	}
	else if (roll >= 2 && roll <= 21) {
		msg = arr2[Math.floor(Math.random() * arr2.length)];
		toAdd = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
	}
	else {
		msg = arr1[Math.floor(Math.random() * arr1.length)];
		toAdd = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	}
	return { msg, toAdd };
}
