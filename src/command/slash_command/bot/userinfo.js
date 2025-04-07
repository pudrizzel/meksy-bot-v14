const Discord = require('discord.js');
const { t } = require('../../../client/languages/i18n');

// Get command name and description in both languages
const commandName = t("userinfo.name", { lng: 'tr' ? 'tr' : 'en'});
const commandDescription = t("userinfo.description", { lng: 'tr' ? 'tr' : 'en' });

module.exports.execute = async (client, interaction) => {
    const userLang = interaction.locale === 'tr' ? 'tr' : 'en';
    
    try {
        // Get the target user (either mentioned user or the command user)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.options.getMember('user') || interaction.member;
        
        if (!targetMember) {
            return interaction.reply({
                content: t("userinfo.user_not_found", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Calculate join and creation dates
        const createdTimestamp = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedTimestamp = Math.floor(targetMember.joinedTimestamp / 1000);
        
        // Get user roles (excluding @everyone)
        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .join(', ') || t("userinfo.none", { lng: userLang });
        
        // Get user status and activity
        const status = targetMember.presence?.status || 'offline';
        const statusEmoji = {
            online: '🟢',
            idle: '🟡',
            dnd: '🔴',
            offline: '⚪'
        }[status] || '⚪';
        
        // Get user activity
        let activity = t("userinfo.none", { lng: userLang });
        if (targetMember.presence?.activities && targetMember.presence.activities.length > 0) {
            const userActivity = targetMember.presence.activities[0];
            if (userActivity.type === 0) activity = `Playing ${userActivity.name}`;
            else if (userActivity.type === 1) activity = `Streaming ${userActivity.name}`;
            else if (userActivity.type === 2) activity = `Listening to ${userActivity.name}`;
            else if (userActivity.type === 3) activity = `Watching ${userActivity.name}`;
            else if (userActivity.type === 4) activity = userActivity.state || 'Custom Status';
            else if (userActivity.type === 5) activity = `Competing in ${userActivity.name}`;
        }
        
        // Get user badges
        const flags = targetUser.flags?.toArray() || [];
        const badges = flags.length ? flags.map(flag => {
            switch (flag) {
                case 'Staff': return '👨‍💼 Discord Staff';
                case 'Partner': return '👥 Discord Partner';
                case 'CertifiedModerator': return '🛡️ Certified Moderator';
                case 'Hypesquad': return '🏠 HypeSquad Events';
                case 'HypeSquadOnlineHouse1': return '🏠 House Bravery';
                case 'HypeSquadOnlineHouse2': return '🏠 House Brilliance';
                case 'HypeSquadOnlineHouse3': return '🏠 House Balance';
                case 'BugHunterLevel1': return '🐛 Bug Hunter (Level 1)';
                case 'BugHunterLevel2': return '🐛 Bug Hunter (Level 2)';
                case 'VerifiedDeveloper': return '👨‍💻 Verified Bot Developer';
                case 'VerifiedBot': return '✅ Verified Bot';
                case 'EarlySupporter': return '🥇 Early Supporter';
                case 'PremiumEarlySupporter': return '🥇 Early Nitro Supporter';
                case 'DiscordCertifiedModerator': return '🛡️ Discord Certified Moderator';
                default: return `${flag}`;
            }
        }).join('\\n') : t("userinfo.none", { lng: userLang });
        
        // Get user permissions
        const permissions = targetMember.permissions.toArray().map(perm => {
            return perm
                .replace(/_/g, ' ')
                .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        });
        
        const keyPermissions = [
            'Administrator',
            'Manage Server',
            'Manage Roles',
            'Manage Channels',
            'Manage Messages',
            'Kick Members',
            'Ban Members',
            'Mention Everyone'
        ];
        
        const userKeyPermissions = permissions.filter(perm => 
            keyPermissions.includes(perm)
        );
        
        // Create the embed
        const embed = new Discord.EmbedBuilder()
            .setColor(/*targetMember.displayHexColor || */'#6366f1')
            .setAuthor({
                name: `${targetUser.username}`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setDescription(`
• **${t("userinfo.general_info", { lng: userLang })}**
▸ ${t("userinfo.username", { lng: userLang })} **${targetUser.username}**
▸ ${t("userinfo.user_id", { lng: userLang })} **${targetUser.id}**
▸ ${t("userinfo.account_created", { lng: userLang })} <t:${createdTimestamp}:R>
▸ ${t("userinfo.joined_server", { lng: userLang })} <t:${joinedTimestamp}:R>
▸ ${t("userinfo.nickname", { lng: userLang })} **${targetMember.nickname || t("userinfo.none", { lng: userLang })}**

• **${t("userinfo.status_info", { lng: userLang })}**
▸ ${t("userinfo.status", { lng: userLang })} ${statusEmoji} **${status.charAt(0).toUpperCase() + status.slice(1)}**
▸ ${t("userinfo.activity", { lng: userLang })} **${activity}**

• **${t("userinfo.server_info", { lng: userLang })}**
▸ ${t("userinfo.highest_role", { lng: userLang })} ${targetMember.roles.highest.toString()}
▸ ${t("userinfo.role_count", { lng: userLang })} **${targetMember.roles.cache.size - 1}**
▸ ${t("userinfo.key_permissions", { lng: userLang })} **${userKeyPermissions.length ? userKeyPermissions.join(', ') : t("userinfo.none", { lng: userLang })}**

• **${t("userinfo.badges", { lng: userLang })}**
${badges === t("userinfo.none", { lng: userLang }) ? `**${badges}**` : badges}
`)
            .setFooter({ 
                text: `${t("userinfo.requested_by", { lng: userLang })} ${interaction.user.username} • ${new Date().toLocaleDateString()}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();
        
        // Send the embed
        await interaction.reply({
            embeds: [embed]
        });
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: t("userinfo.error", { lng: userLang }),
            ephemeral: true
        });
    }
};

module.exports.config = {
    name: commandName,
    description: commandDescription,
    cooldown: 5,
    required_bot_permissions: ["EmbedLinks"],
    options: [
        {
            name: 'user',
            description: 'The user to get information about',
            type: 6, // USER type
            required: false
        }
    ]
};
