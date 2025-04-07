const chalk = require('chalk');
const bot_config = require('./client/config/bot_config.json')
const staff_config = require('./client/config/staff_config.json')

console.log(`
███╗   ███╗███████╗██╗  ██╗███████╗██╗   ██╗  ${chalk.gray('-')} ${chalk.blue('CLIENT VERSION')}           :  v${chalk.cyan(bot_config.version)}
████╗ ████║██╔════╝██║ ██╔╝██╔════╝╚██╗ ██╔╝  ${chalk.gray('-')} ${chalk.blue('NODE_JS VERSION')}          :  v${chalk.cyan(bot_config.node_version)}
██╔████╔██║█████╗  █████╔╝ ███████╗ ╚████╔╝   ${chalk.gray('-')} ${chalk.blue('DISCORD_JS VERSION')}       :  v${chalk.cyan(bot_config.bot_version)}
██║╚██╔╝██║██╔══╝  ██╔═██╗ ╚════██║  ╚██╔╝    ${chalk.gray('-')} ${chalk.blue('STAFF NAME')}               :  ${chalk.cyan(staff_config.staff_name)}
██║ ╚═╝ ██║███████╗██║  ██╗███████║   ██║     ${chalk.gray('-')} ${chalk.blue('BOT PREFIX')}               :  ${chalk.cyan(bot_config.prefix)}
╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝
`);

const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildPresences], messages: { interval: 3600, lifetime: 1800, }, users: { interval: 3600, filter: () => user => user.bot && user.id !== client.user.id, } })

// LANGUAGES
const { setupI18n, t } = require('./client/languages/i18n');
setupI18n();

// Document
require("./client/event/ready.js")(client);
require("./client/handler/login_handler.js")(client);
require("./client/handler/mongo_handler.js")(client);
require("./client/handler/prefix_handler.js")(client);
require("./client/handler/slash_handler.js")(client);

// Bot
process.on('uncaughtException', (err) => {
    if (err.message.includes("Unknown interaction")) return;
});

process.on('unhandledRejection', (reason) => {
    if (reason?.message?.includes("Unknown interaction")) return;
});
