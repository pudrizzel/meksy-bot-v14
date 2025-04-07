const { Collection, EmbedBuilder } = require('discord.js')
const fs = require('fs');
const path = require('path');
const config = require('../config/bot_config.json')
const staff_config = require('../config/staff_config.json')

module.exports = (client) => {
    client.commands = new Collection();
    client.aliases = new Collection();

    let totalCommands = 0;
    
    const categories = fs.readdirSync(path.join(__dirname, '../../command/prefix_command'));
    
    for (const category of categories) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../../command/prefix_command/${category}`)).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../../command/prefix_command/${category}/${file}`));
            client.commands.set(command.name, command);
            totalCommands++;

            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => {
                    client.aliases.set(alias, command.name);
                });
            }
        }
    }

    console.log(`> "Prefix" command number: ${totalCommands}`);

    client.on('messageCreate', async (message) => {
        if (!message.guild || message.author.bot) return;

        const prefix = config.prefix;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

        // Only allow the staff (owner) to use prefix commands
        if (message.author.id !== staff_config.staff_id) {
            return; // Silently ignore commands from non-staff users
        }

        if (command) {
            command.execute(client, message, args);
        }
    });
};
