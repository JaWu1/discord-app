const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const profileModel = require('../../models/profileSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('A honkai star rail roll'),
	async execute(interaction, profileData) {

        const { id } = interaction.user;
        const randNum = Math.random();
        let { star4, star5, inventory, guaranteedBanner } = profileData;
        const { msg, toAdd, guaranteedBanner: upGB } = resultTicket(randNum, star4, star5, guaranteedBanner);

        /////////////////////////
        // check we have ticket
        const findHSRticket = inventory.find((i) => i.name.toLowerCase() === 'honkai rail pass');

        if (findHSRticket) {
            findHSRticket.quantity -= 1;

            if (findHSRticket.quantity <= 0) {
                inventory.splice(inventory.indexOf(findHSRticket), 1);
            }

            await profileModel.findOneAndUpdate(
                { userId: id },
                {
                    inventory: inventory,
                }
            );
        } else {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply(`You do not have a Honkai Rail Pass in your inventory`);
        }
        /////////////////////////


        // roll counter
        if (msg.includes('4-star')) {
            await profileModel.findOneAndUpdate(
                { userId: id },
                { 
                    $inc: { star5: 1 },
                    $set: { star4: 0 }, 
                }
            );
        } else if (msg.includes('5-star')) {
            await profileModel.findOneAndUpdate(
                { userId: id },
                { 
                    $set: { star4: 0 , star5: 0 }, 
                }
            );
        } else {
            await profileModel.findOneAndUpdate(
                { userId: id },
                { 
                    $inc: { star4: 1 , star5: 1 }, 
                }
            );
        }

        // 50/50 depends on each character holds a bool whether it is true for guaranteed
        const hsrIcon = 'https://play-lh.googleusercontent.com/AsaeL9oWkGdjyDNwbmzsaYY_WxdPrmQVGUfgfzL4mhJteC1X3HdLib9bafnXaYr3WB8=s96-rw';
        const fiveEmbed = new EmbedBuilder();
        const exampleEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Roll`)
            .setDescription(`${msg} ${toAdd}`)

        if (msg.includes('3-star')) {
            exampleEmbed.setColor(0x0099FF);
        }
        else if (msg.includes('4-star')) {
            exampleEmbed
                .setColor(0x800080)
                .setImage('https://cdn.mos.cms.futurecdn.net/C44LSfoWygK79MAwcyHvxi-1200-80.jpg.webp');
        }
        else if (msg.includes('5-star')) {
            exampleEmbed
                .setColor(0xFFD700)
                .setImage('https://media1.tenor.com/m/P8xMsY3XcnkAAAAd/pompom-honkai-star-rail.gif')
                .setFooter({ text: 'Honkai Star Rail 2.0', iconURL: hsrIcon });

            if (toAdd.includes('Banner')) {
                fiveEmbed
                    .setTitle('Sparkle')
                    .setDescription('A member of the Masked Fools. Inscrutable and unscrupulous')
                    .setColor(0xFFD700)
                    .setImage('https://media1.tenor.com/m/K3DqT9hTzakAAAAd/honkai-star-rail-hsr.gif')
                    .setFooter({ text: 'Honkai Star Rail 2.0', iconURL: hsrIcon });

                const existingItem = inventory.find((i) => i.name.toLowerCase() === bannerUnit.name.toLowerCase());

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    inventory.push({ emoji: bannerUnit.emoji, name: bannerUnit.name, quantity: 1 });
                }
            } else {
                const randFive = char5[Math.floor(Math.random() * char5.length)];
                fiveEmbed
                    .setTitle(randFive.name)
                    .setDescription(randFive.desc)
                    .setColor(0xFFD700)
                    .setImage(randFive.pic)
                    .setFooter({ text: 'Honkai Star Rail 2.0', iconURL: hsrIcon });
                    
                const existingItem = inventory.find((i) => i.name.toLowerCase() === randFive.name.toLowerCase());

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    inventory.push({ emoji: randFive.emoji, name: randFive.name, quantity: 1 });
                }
            }

            await profileModel.findOneAndUpdate(
                { userId: id },
                {
                    inventory: inventory,
                    guaranteedBanner: upGB,
                },
            ); 

            await interaction.reply({ embeds: [exampleEmbed, fiveEmbed] });
            return;
        }

        await interaction.reply({ embeds: [exampleEmbed] });
        
	},
};

function resultTicket(roll, star4, star5, guaranteedBanner) {
    let toAdd = '';
	let msg = '';

    if (roll < 0.006) {
        ({ msg, toAdd, guaranteedBanner } = get5star(guaranteedBanner));
    }
    else if (star5 >= 89) {
        ({ msg, toAdd, guaranteedBanner } = get5star(guaranteedBanner));
    }
    else if (star4 >= 9) {
        msg = 'Guaranteed 4-star';
    } 
	else if (roll < 0.057) {
        msg = '4-star pulled!';
    }
    else {
        msg = '3-star pulled!';
    }

	return { msg, toAdd, guaranteedBanner};
}

function get5star(guaranteedBanner) {

    // Check if guaranteed
    if (guaranteedBanner) {
        msg = 'Guarantee 5-star pulled!';
        toAdd = 'Banner';
        guaranteedBanner = false;

        return {msg, toAdd, guaranteedBanner};
    }

    // Not guaranteed 50/50
    const bannerChance = Math.random();
    if (bannerChance < 0.5) {
        msg = 'Banner 5-star pulled!';
        toAdd = 'Banner';
        guaranteedBanner = false;
    } else {
        msg = 'Normal 5-star pulled!';
        toAdd = ''
        guaranteedBanner = true;
    }
    return {msg, toAdd, guaranteedBanner};
}

const char5 = [
	{
		name: 'Himeko',
		desc: `An adventurous scientist and the Astral Express' navigator`,
		pic: 'https://s1.zerochan.net/Himeko.%28Honkai.Star.Rail%29.600.3937382.jpg',
        emoji: '<:himeko:1189901368329244753>'
	},
	{
		name: 'Welt',
		desc: 'An animator by trade, and member of the Astral Express Crew',
        pic: 'https://s1.zerochan.net/Welt.Yang.600.3937374.jpg',
        emoji: '<:Welt:1189902048632782909>'
	},
	{
		name: 'Bronya',
		desc: 'Commander of the Silvermane Guards and current Supreme Guardian of Belobog',
		pic: 'https://s1.zerochan.net/Bronya.Rand.600.3937372.jpg',
        emoji: '<:bronya:1192420930052427807>'
	},
    {
		name: 'Gepard',
		desc: 'Captain of the Silvermane Guards',
		pic: 'https://s1.zerochan.net/Gepard.Landau.600.3937375.jpg',
        emoji: '<:gepard:1189901396456251452>'
	},
    {
		name: 'Clara',
		desc: 'Svarog protecc',
		pic: 'https://s1.zerochan.net/Clara.%28Honkai.Star.Rail%29.600.3937381.jpg',
        emoji: '<:clara:1189901450961223770>'
	},
    {
		name: 'Yanqing',
		desc: `The youngest lieutenant of the Xianzhou Alliance's Cloud Knights`,
		pic: 'https://s1.zerochan.net/Yanqing.600.3937383.jpg',
        emoji: '<:yanqing:1189901425120120933>'
	},
    {
		name: 'Bailu',
		desc: 'No bailu bailu bailu',
		pic: 'https://s1.zerochan.net/Bailu.600.3937385.jpg',
        emoji: '<:bailu:1189901970320916501>'
	},

];

const bannerUnit = {
    name: 'Sparkle',
    desc: 'A member of the Masked Fools. Inscrutable and unscrupulous',
    pic: 'https://media1.tenor.com/m/K3DqT9hTzakAAAAd/honkai-star-rail-hsr.gif',
    emoji: '<:sparkle:1212722665060696074>'
}