const Discord = require('discord.js');
const { t } = require('../../../client/languages/i18n');
const mongoose = require('mongoose');

const commandName = t("info.name", { lng: 'tr' ? 'tr' : 'en'});
const commandDescription = t("info.description", { lng: 'tr' ? 'tr' : 'en' });

module.exports.execute = async (client, interaction) => {
    const userLang = interaction.locale === 'tr' ? 'tr' : 'en';

    try {
        const apiStartTime = Date.now();
        await interaction.guild.members.fetch(interaction.user.id);
        const apiResponseTime = Date.now() - apiStartTime;

        const messageStartTime = Date.now();
        const message = await interaction.deferReply({ fetchReply: true });
        const messageLatency = Date.now() - messageStartTime;

        let dbPing = 'N/A';
        if (mongoose.connection.readyState === 1) {
            const dbStartTime = Date.now();
            await mongoose.connection.db.admin().ping();
            dbPing = `${Date.now() - dbStartTime}ms`;
        } else {
            dbPing = 'Not connected';
        }

        const uptime = client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor(uptime / 3600000) % 24;
        const minutes = Math.floor(uptime / 60000) % 60;
        const seconds = Math.floor(uptime / 1000) % 60;
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const totalServers = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalEmojis = client.emojis.cache.size;
        
        const slashCommands = client.application?.commands?.cache?.size || 0;
        const prefixCommands = Object.keys(client.commands || {}).length || 0;
        const totalCommands = slashCommands + prefixCommands;
        
        const memoryUsage = process.memoryUsage();
        const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2);
        const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
        const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        const external = (memoryUsage.external / 1024 / 1024).toFixed(2);

        let onlineUsers = 0;
        let idleUsers = 0;
        let dndUsers = 0;
        let offlineUsers = 0;
        let botUsers = 0;
        
        await Promise.all(client.guilds.cache.map(async (guild) => {
            try {
                if (guild.available) {
                    const members = await guild.members.fetch();
                    
                    members.forEach(member => {
                        if (member.user.bot) {
                            botUsers++;
                        } else {
                            // Count by presence status
                            const status = member.presence?.status || 'offline';
                            if (status === 'online') onlineUsers++;
                            else if (status === 'idle') idleUsers++;
                            else if (status === 'dnd') dndUsers++;
                            else if (status === 'offline') offlineUsers++;
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching members for guild ${guild.id}:`, error);
            }
        }));
        
        const createRamBar = () => {
            const percentage = Math.min(Math.max(memoryUsage.heapUsed / memoryUsage.heapTotal, 0), 1);
            const barLength = 15;
            const filledLength = Math.round(barLength * percentage);
            
            const filledSquares = '■'.repeat(filledLength);
            const emptySquares = '□'.repeat(barLength - filledLength);
            
            return `${filledSquares}${emptySquares} ${Math.round(percentage * 100)}%`;
        };
        
        const ramBar = createRamBar();
        
        const botAvatarURL = interaction.client.user.displayAvatarURL({ size: 4096, dynamic: true });

        const info = new Discord.EmbedBuilder()
            .setColor(interaction.user.displayHexColor || '#6366f1')
            .setAuthor({ 
                name: `${interaction.client.user.username} — ${t("info.title", { lng: userLang })}`, 
                iconURL: botAvatarURL
            })
            .setThumbnail(botAvatarURL)
            .setDescription(`
- **${t("info.ping", { lng: userLang }).replace('###', '').trim()}**
- ${t("info.ping2", { lng: userLang })} **${client.ws.ping}ms**
- ${t("info.ping3", { lng: userLang })} **${apiResponseTime}ms**
- ${t("info.ping4", { lng: userLang })} **${messageLatency}ms**
- ${t("info.ping5", { lng: userLang })} **${dbPing}**
- ${t("info.ping6", { lng: userLang })} **${uptimeString}**

- **${t("info.server", { lng: userLang }).replace('###', '').trim()}**
- ${t("info.server1", { lng: userLang })} **${totalServers}**
- ${t("info.server2", { lng: userLang })} **${totalUsers}**
- ${t("info.server3", { lng: userLang })} **${totalChannels}**
- ${t("info.server4", { lng: userLang })} **${totalEmojis}**
- ${t("info.server5", { lng: userLang })} **${totalCommands}**

- **${t("info.memory", { lng: userLang }).replace('###', '').trim()}**
- ${t("info.memory1", { lng: userLang })} **${rss} MB**
- ${t("info.memory2", { lng: userLang })} **${heapTotal} MB**
- ${t("info.memory3", { lng: userLang })} **${heapUsed} MB**
- ${t("info.memory4", { lng: userLang })} **${external} MB**
- **RAM Bar:** ${ramBar}

- **${t("info.user", { lng: userLang }).replace('###', '').trim()}**
- ${t("info.user1", { lng: userLang })} **${onlineUsers}**
- ${t("info.user2", { lng: userLang })} **${idleUsers}**
- ${t("info.user3", { lng: userLang })} **${dndUsers}**
- ${t("info.user4", { lng: userLang })} **${offlineUsers}**
- ${t("info.user5", { lng: userLang })} **${botUsers}**
`)
            .setFooter({ 
                text: `${interaction.client.user.username} • ${new Date().toLocaleDateString()}`, 
                iconURL: 'https://cdn.discordapp.com/attachments/1357484677732106241/1358763754485190860/cicek.png?ex=67f506db&is=67f3b55b&hm=d0f625236a69f4a116750ddece9f47111ea127bdd1289af8cdc3537182b10261&'
            });
            
        await interaction.editReply({
            embeds: [info]
        });
    } catch (err) {
        console.error(err);
    }
}

module.exports.config = {
    name: commandName,
    description: commandDescription,
    cooldown: 20,
    required_bot_permissions: ["ManageMessages"],
    options: []
}
