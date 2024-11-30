const { ButtonBuilder, ActionRowBuilder } = require("@discordjs/builders")
const { queryParams } = require("../db/db")
const { ButtonStyle } = require("discord.js")
const { footer } = require("./../config.json")
module.exports = async (email, id, current) => {
    let embed = {
        title: email,
        color: 0x808080
    }
    let buttons = []

    let msg = {
        ephemeral: true
    }
    let notificationButton
    let isNotified = await queryParams(`SELECT * FROM email_notifier WHERE user_id=? AND email=?`, [id, email])
    if (isNotified.length == 0) {
        notificationButton = new ButtonBuilder().setCustomId("notifier|" + email + "|" + current).setLabel("Enable Notifications").setEmoji({ name: "🔔" }).setStyle(ButtonStyle.Success)
    } else {
        notificationButton = new ButtonBuilder().setCustomId("notifier|" + email + "|" + current).setLabel("Disable Notifications").setEmoji({ name: "🔔" }).setStyle(ButtonStyle.Danger)
    }
    let emails = await queryParams(`SELECT * FROM emails WHERE receiver=?`, [email])
    if (emails.length == 0) {
        embed.description = `No Emails yet!`
    } else {
        if (emails.length < current) { current = emails.length }
        if (current < 1) { current = 1 }
        msg.content = `${email}`
        embed.title = emails[current - 1]?.subject ? emails[current - 1].subject.replaceAll("*", "\\*") : `No Subject!`
        embed.description = emails[current - 1]?.description ? emails[current - 1].description.replaceAll("*", "\\*") : `No description!`
        const d = new Date(parseInt(emails[current - 1].time))
        embed.timestamp = d.toISOString()
        embed.footer = footer
        let next = (parseInt(current) + 1).toString()
        let back = (parseInt(current) - 1).toString()
        let fastforward = emails.length
        buttons.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("move|" + email + "|1"+"|fastbackward").setEmoji({ name: "⏪" }).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("move|" + email + "|" + back+"|backward").setEmoji({ name: "◀️" }).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("current|" + email).setLabel(current + "/" + emails.length).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("move|" + email + "|" + next+"|forward").setEmoji({ name: "➡️" }).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("move|" + email + "|" + fastforward+"|fastforward").setEmoji({ name: "⏩" }).setStyle(ButtonStyle.Primary),
        ))
    }
    buttons.push(new ActionRowBuilder().addComponents(notificationButton))
    msg.embeds = [embed]
    msg.components = buttons
    return msg

}