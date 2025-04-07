const Discord = require('discord.js')
const { t } = require('../../../client/languages/i18n');

module.exports = {
name: 'test',
aliases: [''],

async execute(client, message, args) {
// Detect language based on guild settings
const embed = new Discord.EmbedBuilder()
  .setColor(0x0015ff)
  .setDescription(':moneybag: Üyelik satın almak için <:marpel:1351778847091200042> Marpel\'in sâhibine ulaşabilirsiniz\n<:tac:1358699204842750103>  <@1347530331422461993>\n\n<:timer:1351778645907083325> Üyelik Kalan Süre: **23 gün 19 saat 24 dakika 16 saniye**\n:moneybag: Bu sunucuya üyeliği satın alan: @tornado <:id:1358699536402350202> \n(**1220351220049252352**)')
  .setImage('https://cdn.discordapp.com/attachments/897530400618999859/1264534468572610633/ozelbot-tanitim.png?ex=67f4563f&is=67f304bf&hm=a40e1a0653f67aae7209b871a8f7eba3ff25672f4de6ecdd80de1ccb70b363d9&')
message.channel.send({ embeds: [embed] })

},
};