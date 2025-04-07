const Discord = require('discord.js');
const { t } = require('../../../client/languages/i18n');
const Mute = require('../../../client/models/mute');
const { parseDuration, formatDuration } = require('../../../client/utils/durationParser');

// Get command name and description in both languages
const commandName = t("mute.name", { lng: 'tr' ? 'tr' : 'en' });
const commandDescription = t("mute.description", { lng: 'tr' ? 'tr' : 'en' });

module.exports.execute = async (client, interaction) => {
    const userLang = interaction.locale === 'tr' ? 'tr' : 'en';
    
    try {
        // Check if the user has permission to mute
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return interaction.reply({
                content: t("mute.no_permission", { lng: userLang }),
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
        
        // Check if the target is the user themselves
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: t("mute.cannot_mute_self", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Check if the target is a bot
        if (targetUser.bot) {
            return interaction.reply({
                content: t("mute.cannot_mute_bot", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Check if the target has admin permissions
        if (targetMember.permissions.has('Administrator')) {
            return interaction.reply({
                content: t("mute.cannot_mute_admin", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Get the duration and reason
        const durationString = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || t("mute.no_reason", { lng: userLang });
        
        // Parse the duration
        let duration = 0; // Default to permanent
        let expiresAt = null;
        
        if (durationString) {
            duration = parseDuration(durationString);
            
            if (duration === null) {
                return interaction.reply({
                    content: t("mute.duration_invalid", { lng: userLang }),
                    ephemeral: true
                });
            }
            
            if (duration > 0) {
                expiresAt = new Date(Date.now() + duration);
            }
        }
        
        // Check if the user is already muted
        const existingMute = await Mute.findOne({
            userId: targetUser.id,
            guildId: interaction.guild.id,
            active: true
        });
        
        if (existingMute) {
            return interaction.reply({
                content: t("mute.already_muted", { lng: userLang }),
                ephemeral: true
            });
        }
        
        // Create a timeout in Discord (if duration is specified and less than 28 days)
        if (duration > 0 && duration <= 28 * 24 * 60 * 60 * 1000) {
            try {
                await targetMember.timeout(duration, reason);
            } catch (error) {
                console.error('Error applying timeout:', error);
                // Continue with the mute even if timeout fails
            }
        }
        
        // Create a new mute record
        const mute = new Mute({
            userId: targetUser.id,
            guildId: interaction.guild.id,
            moderatorId: interaction.user.id,
            reason: reason,
            duration: duration,
            expiresAt: expiresAt,
            active: true
        });
        
        await mute.save();
        
        // Create the mute notification embed
        const muteEmbed = new Discord.EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(t("mute.mute_notification_title", { lng: userLang }))
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: t("mute.muted_by", { lng: userLang }), value: `<@${interaction.user.id}>`, inline: true },
                { name: t("mute.muted_user", { lng: userLang }), value: `<@${targetUser.id}>`, inline: true },
                { name: t("mute.reason", { lng: userLang }), value: reason, inline: false }
            )
            .setFooter({ 
                text: t("mute.footer", { lng: userLang, userId: targetUser.id }),
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
        
        // Add duration field if not permanent
        if (duration > 0) {
            muteEmbed.addFields(
                { name: t("mute.duration", { lng: userLang }), value: formatDuration(duration, userLang), inline: true },
                { name: t("mute.expires", { lng: userLang }), value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: true }
            );
        } else {
            muteEmbed.addFields(
                { name: t("mute.duration", { lng: userLang }), value: t("mute.permanent", { lng: userLang }), inline: true }
            );
        }
        
        // Send the mute notification
        await interaction.reply({
            embeds: [muteEmbed]
        });
        
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: t("mute.error", { lng: userLang }),
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
            description: 'The user to mute',
            type: 6, // USER type
            required: true
        },
        {
            name: 'duration',
            description: 'Duration of the mute (e.g. 1h, 30m, 1d)',
            type: 3, // STRING type
            required: false
        },
        {
            name: 'reason',
            description: 'Reason for the mute',
            type: 3, // STRING type
            required: false
        }
    ]
};
