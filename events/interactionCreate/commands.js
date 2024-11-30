const getLocalCmds = require('../../utils/getLocalCmds');
const { join } = require('path');
module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return
  const localCommands = getLocalCmds(join(__dirname, "..", "..", "Commands"))
  try {
    const cmdObj = localCommands.find((cmd) => cmd.name === interaction.commandName)
    if (!cmdObj) return


    console.log(`${cmdObj.name}|${interaction.user.username}|Command|${new Date().toISOString()}`)
    await cmdObj.callback(client, interaction)


  } catch (e) {
    console.log(e)
  }
}