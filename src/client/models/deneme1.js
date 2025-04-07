const {model, Schema, Types} = require("mongoose")

module.exports = model("Guard_Role_System", new Schema(
    {
        guildId: { type: String, required: true },
        logChannel: { type: String, required: true },
        roleDeleteLimit: { type: Number, default: 3 },
        roleCreateLimit: { type: Number, default: 3 },
        punishmentType: { type: Number, default: 1 }, // 1-4 ceza türü
        allowedUsers: { type: [String], default: [] }, // Rol ekleyip silmesine izin verilen kişiler
        hasUsedLogCommand: { type: Boolean, default: false }
    }
))