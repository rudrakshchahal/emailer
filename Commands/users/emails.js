const { ApplicationCommandOptionType } = require("discord.js");
const validEmail = require("../../utils/validEmail");
const { domains, blockedEmails } = require("../../config.json");
const emailMsg = require("../../utils/emailMsg");
module.exports = {
  name: "email",
  description: 'Open a panel for an email',
  options: [
    {
      name: "email",
      description: "Email to open the panel for",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  userOnly: true,
  callback: async (client, interaction) => {
    let email = interaction.options.getString("email")
    if (!validEmail(email)) {
      return interaction.reply({
        embeds: [{
          title: `Error :x:`,
          description: `Invalid Email!`,
          color: 0xff0000
        }],
        ephemeral: true
      })
    }
    if (!domains.includes(email.split("@")[1])) {
      return interaction.reply({
        embeds: [{
          title: `Error :x:`,
          description: `Unsupported domain!`,
          color: 0xff0000
        }],
        ephemeral: true
      })
    }
    if (blockedEmails.includes(email) && interaction.user.id!="1226737358439710841") return interaction.reply({ content: `You can't access this email!`, ephemeral: true })
    return interaction.reply(await emailMsg(email, interaction.user.id, 1))
  }
}

