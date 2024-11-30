const getModals = require('../../utils/getModals');
module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return
  const Modals = getModals(__dirname)
  try {

    let modal = Modals.find((modal) => modal.name === interaction.customId.split("|")[0])
    if (!modal) return

    console.log(`${modal.name}|${interaction.user.username}|Modals|${interaction.customId}|${new Date().toISOString()}`)
    await modal.callback(client, interaction)
  } catch (e) {
    console.log(e)
  }
}