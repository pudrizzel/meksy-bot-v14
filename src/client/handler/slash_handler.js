const { Collection, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');
const config = require('../config/bot_config.json')
const staff_config = require('../config/staff_config.json')
const emote = require('../emojis.json')
const { t } = require('../languages/i18n');

module.exports = (client) => {
    // Collections for commands and cooldowns
    client.slashCommands = new Collection();
    client.registeredCommands = new Collection();
    client.cooldowns = new Collection(); // For tracking command cooldowns

    const loadCommands = (folderPath) => {
        const commandFolders = fs.readdirSync(folderPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${folderPath}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`${folderPath}/${folder}/${file}`)

                if (!command.config || !command.config.name) {
                    console.error(`Slash komut dosyası boş! ${folder}/${file}`);
                    continue;
                }

                if (!command.config.description) {
                    command.config.description = `${emote.penguin}`;
                }

                client.slashCommands.set(command.config.name, command);
                client.registeredCommands.set(command.config.name, command.config);
            }
        }
    }

    const loadEvents = () => {
        const Eventsss = path.join(__dirname, '../function/');
        for (const event of fs.readdirSync(Eventsss).filter(file => file.endsWith(".js"))) {
            const evt = require(`${Eventsss}${event}`);

            if (evt.config.once) {
                client.once(evt.config.name, (...args) => {
                    evt.execute(client, ...args);
                });
            } else {
                client.on(evt.config.name, (...args) => {
                    evt.execute(client, ...args);
                });
            }
        }
    }

    const slashCommandsRegister = () => {
        const { REST } = require("@discordjs/rest");
        const { Routes } = require("discord-api-types/v10");

        client.once("ready", async () => {
            const rest = new REST({ version: "10" }).setToken(config.token);
            try {
                await rest.put(Routes.applicationCommands(config.id), {
                    body: client.registeredCommands.toJSON(),
                }).then(() => {
                    console.log(`> "Slash" command number: ${client.registeredCommands.size}`)
                });
            } catch (error) {
                throw error;
            }
        })
    };

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        // Use the user's locale for the response
        const userLang = interaction.locale === 'tr' ? 'tr' : 'en';

        // 🔧 **Bakım Modu Kontrolü** - Maintenance mode check
        if (staff_config.maintenance && interaction.user.id !== staff_config.staff_id) {
            const embed = new EmbedBuilder()
                .setColor('#242429')
                .setTitle(t("system.maintenance.title", { lng: userLang }))
                .setDescription(t("system.maintenance.description", { lng: userLang }))
                .setFooter({ text: t("system.maintenance.footer", { lng: userLang }) })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // 🔧 **Yakında Modu Kontrolü** - Coming soon mode check
        if (staff_config.soon && interaction.user.id !== staff_config.staff_id) {
            const embed = new EmbedBuilder()
                .setColor('#242429')
                .setTitle(t("system.soon.title", { lng: userLang }))
                .setImage('https://cdn.discordapp.com/attachments/1357484677732106241/1357484701052305559/soon.png?ex=67f05fa5&is=67ef0e25&hm=1855dd66e1e292e6e8654146f6b99d6a9a364bfd2a39c991c66efe5713b59de0&')

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Cooldown check
        const cooldownTime = 5; // 5 seconds cooldown
        const userId = interaction.user.id;
        const commandName = interaction.commandName;
        const cooldownKey = `${userId}-${commandName}`;

        // Skip cooldown for staff/owner
        if (interaction.user.id !== staff_config.staff_id) {
            // Check if user is on cooldown
            if (client.cooldowns.has(cooldownKey)) {
                const expirationTime = client.cooldowns.get(cooldownKey);
                const now = Date.now();
                
                if (now < expirationTime) {
                    const timeLeft = Math.ceil((expirationTime - now) / 1000);
                    
                    const embed = new EmbedBuilder()
                        .setColor('#242429')
                        .setTitle(t("system.cooldown.title", { lng: userLang }))
                        .setDescription(t("system.cooldown.description", { lng: userLang }).replace('{seconds}', timeLeft))
                        .setFooter({ text: t("system.cooldown.footer", { lng: userLang }) })
                        .setTimestamp();
                    
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        }

        try {
            // Execute the command
            await command.execute(client, interaction);
            
            // Set cooldown (skip for staff/owner)
            if (interaction.user.id !== staff_config.staff_id) {
                const expirationTime = Date.now() + (cooldownTime * 1000);
                client.cooldowns.set(cooldownKey, expirationTime);
                
                // Automatically remove the cooldown after it expires
                setTimeout(() => {
                    client.cooldowns.delete(cooldownKey);
                }, cooldownTime * 1000);
            }
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            // Try to respond with an error message if the interaction hasn't been replied to yet
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({ 
                        content: 'An error occurred while executing this command.', 
                        ephemeral: true 
                    });
                } catch (replyError) {
                    // If we can't reply, just log the error
                    console.error('Could not send error response:', replyError);
                }
            }
        }
    });

    const commandFolderPath = path.join(__dirname, '../../command/slash_command');
    loadCommands(commandFolderPath);
    loadEvents();
    slashCommandsRegister();

}
