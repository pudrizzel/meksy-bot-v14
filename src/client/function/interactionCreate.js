module.exports.execute = async(client, interaction) => {
    // We don't need to handle slash commands here as they're already handled in slash_handler.js
    // This prevents the "Unknown interaction" error due to double handling
    return;
}
 
 module.exports.config = {
     name: "interactionCreate",
     once: false
 }
