const getButtons = require("../../utils/getButtons");
module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  const Buttons = getButtons(__dirname);
  try {
    let button = Buttons.find((button) => button.name === interaction.customId.split("|")[0])
    if (!button) return;
    console.log(`${button.name}|${interaction.user.username}|Button|${interaction.customId}|${new Date().toISOString()}`);
    await button.callback(client, interaction);
  } catch (e) {
    console.log(e);
  }
};
