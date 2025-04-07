const bot_config = require('../config/bot_config.json')
const mongo_config = require('../config/database_config.json')

module.exports = (client) => {

    client.on("ready", () => {
        require("../event/mongoose.js")(mongo_config.database)
        console.log(`> "MongoDB" to connecting from ${bot_config.name} bot`)
    })

}