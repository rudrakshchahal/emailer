const modalBuilder = require("../../utils/modalBuilder")

module.exports = {
    name: "current",
    callback: async (client, interaction) => {
        let email = interaction.customId.split("|")[1]
        interaction.showModal(modalBuilder(`current|${email}`, `Go to Mail`, [{
            setCustomId: 'page',
            setMaxLength: 10,
            setMinLength: 1,
            setRequired: true,
            setLabel: "Email Number",
            setPlaceholder: "Ex: 12",
            setStyle: 1
        }]))
    }
}