const mongoose = require('mongoose');

const muteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    moderatorId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: 'No reason provided'
    },
    mutedAt: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number, // Duration in milliseconds
        default: 0 // 0 means permanent
    },
    expiresAt: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: true
    }
});

// Create a compound index on userId and guildId for faster lookups
muteSchema.index({ userId: 1, guildId: 1 });

// Create an index on expiresAt for the unmute check
muteSchema.index({ expiresAt: 1, active: 1 });

module.exports = mongoose.model('Mute', muteSchema);
