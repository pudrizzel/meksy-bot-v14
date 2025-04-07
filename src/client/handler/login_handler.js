const config = require('../config/bot_config.json')

module.exports = (client) => {

    client.login(config.token).then(() => {
        console.log(`> "${config.name}" join from discord`);
    }).catch((err) => {
        console.log(`> "${config.name}" error joined for: ${err}`);
    });

}