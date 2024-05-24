const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Import the 'node-fetch' library for making HTTP requests

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Gets a random motivational quote'),
	async execute(interaction) {
		const quoteData = await getQuote();

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Random Quote')
			.setDescription(`${quoteData.quote}`)
			.setFooter({ text: getFooter(quoteData.author) });

		await interaction.reply({ embeds: [embed] });
	},
};

async function getQuote() {
	const response = await fetch('https://zenquotes.io/api/random');
	const data = await response.json();
	return { quote: data[0]['q'], author: data[0]['a'] };
}

function getFooter(author) {
	return ` - ${author}`;
}
