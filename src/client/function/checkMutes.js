const Mute = require('../models/mute');
const { t } = require('../languages/i18n');

/**
 * Check for expired mutes and unmute users
 * @param {Client} client - The Discord.js client
 */
async function checkMutes(client) {
    try {
        const expiredMutes = await Mute.find({
            active: true,
            expiresAt: { $lte: new Date() },
            expiresAt: { $ne: null } // Exclude permanent mutes
        });

        if (expiredMutes.length === 0) return;

        console.log(`Found ${expiredMutes.length} expired mutes to process`);

        for (const mute of expiredMutes) {
            try {
                // Get the guild and member
                const guild = await client.guilds.fetch(mute.guildId).catch(() => null);
                if (!guild) {
                    console.log(`Guild ${mute.guildId} not found, marking mute as inactive`);
                    mute.active = false;
                    await mute.save();
                    continue;
                }

                const member = await guild.members.fetch(mute.userId).catch(() => null);
                
                if (member && member.communicationDisabledUntil) {
                    await member.timeout(null, 'Mute duration expired').catch(err => {
                        console.error(`Error removing timeout for ${member.user.tag}:`, err);
                    });
                }

                mute.active = false;
                await mute.save();

                // This is optional and depends on your bot's configuration
                try {
                    // const logChannel = guild.channels.cache.get(YOUR_LOG_CHANNEL_ID);
                    // if (logChannel) {
                    //     await logChannel.send(`Mute expired for <@${mute.userId}>`);
                    // }
                } catch (notifyError) {
                    console.error('Error sending unmute notification:', notifyError);
                }

                console.log(`Successfully processed expired mute for user ${mute.userId} in guild ${mute.guildId}`);
            } catch (muteError) {
                console.error(`Error processing expired mute:`, muteError);
            }
        }
    } catch (error) {
        console.error('Error checking for expired mutes:', error);
    }
}

module.exports = {
    checkMutes,
    config: {
        name: 'checkMutes',
        once: false
    },
    execute: async (client) => {
        console.log('> Mute checker event loaded');
    }
};
