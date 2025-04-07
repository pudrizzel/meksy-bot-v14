const Discord = require('discord.js');
const { t } = require('../../../client/languages/i18n');
const Mute = require('../../../client/models/mute');

// Get command name and description in both languages
const commandName = t("unmute.name", { lng: 'tr' ? 'tr' : 'en' });
const commandDescription = t("unmute.description", { lng: 'tr' ? 'tr' : 'en' });

module.exports.execute = async (client, interaction) => {
    const userLang = interaction.locale === 'tr' ? 'tr' : 'en';
    
    try {
        // Check if the user has permission to unmute
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return interaction.reply({
                content: t("unmute.no_permission", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Get the target user
        const targetUser = interaction.options.getUser('user');
        const targetMember = interaction.options.getMember('user');
        
        if (!targetMember) {
            return interaction.reply({
                content: t("userinfo.user_not_found", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Get the reason
        const reason = interaction.options.getString('reason') || t("unmute.no_reason", { lng: userLang });
        
        // Check if the user is muted
        const existingMute = await Mute.findOne({
            userId: targetUser.id,
            guildId: interaction.guild.id,
            active: true
        });
        
        if (!existingMute) {
            return interaction.reply({
                content: t("unmute.not_muted", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Remove timeout in Discord if it exists
        try {
            if (targetMember.communicationDisabledUntil) {
                await targetMember.timeout(null, reason);
            }
        } catch (error) {
            console.error('Error removing timeout:', error);
            // Continue with the unmute even if timeout removal fails
        }
        
        // Update the mute record
        existingMute.active = false;
        await existingMute.save();
        
        // Create the unmute notification embed
        const unmuteEmbed = new Discord.EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(t("unmute.unmute_notification_title", { lng: userLang }))
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: t("unmute.unmuted_by", { lng: userLang }), value: `<@${interaction.user.id}>`, inline: true },
                { name: t("unmute.unmuted_user", { lng: userLang }), value: `<@${targetUser.id}>`, inline: true },
                { name: t("unmute.reason", { lng: userLang }), value: reason, inline: false }
            )
            .setFooter({ 
                text: t("unmute.footer", { lng: userLang, userId: targetUser.id }),
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
        
        // Send the unmute notification
        await interaction.reply({
            embeds: [unmuteEmbed]
        });
        
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: t("unmute.error", { lng: userLang }),
            ephemeral: true
        });
    }
};

module.exports.config = {
    name: commandName,
    description: commandDescription,
    cooldown: 3,
    required_bot_permissions: ["ModerateMembers"],
    options: [
        {
            name: 'user',
            description: 'The user to unmute',
            type: 6, // USER type
            required: true
        },
        {
            name: 'reason',
            description: 'Reason for the unmute',
            type: 3, // STRING type
            required: false
        }
    ]
};
