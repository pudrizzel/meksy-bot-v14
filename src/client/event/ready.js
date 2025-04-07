const config = require('../config/bot_config.json')
    
module.exports = (client) => {
    client.on('ready', () => {
        setInterval(() => {
            client.user.setActivity(`${config.durum}`);
        }, 5000);
        console.log(`> "${config.name}" Bot active for discord`);
    });
};