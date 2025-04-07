const config = require('../config/bot_config.json');
const { checkMutes } = require('./checkMutes');

module.exports.execute = async (client) => {
    // Set bot activity
    setInterval(() => {
        client.user.setActivity(`${config.durum}`);
    }, 5000);
    
    console.log(`> "${config.name}" Bot active for discord`);
    
    // Start the mute checker
    console.log('> Starting mute checker...');
    await checkMutes(client);
    
    // Set up interval to check for expired mutes every minute
    setInterval(() => checkMutes(client), 60000);
};

module.exports.config = {
    name: "ready",
    once: true
};
