const { SMTPServer } = require("smtp-server");
const { EventEmitter } = require("events");
const { simpleParser } = require("mailparser");
const receivedCode = new EventEmitter();
const { queryParams } = require("../db/db");
const embedWrapper = require("./embedWrapper");
const discord = require("discord.js");
const config = require("../config.json");

const emailer = new discord.Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers"], // Adding intents,
  presence: {
    activities: [
      {
        name: "Emailer",
        type: discord.ActivityType.Custom,
        state: "Sending emails!",
      },
    ],
    status: "idle",
  },
});
function initializeSmtp() {
  emserver.listen(25, "0.0.0.0", () => {
    console.log(`SMTP listening on 25`);
  });
  emailer.login(config.emailerToken);

  emailer.on("ready", async () => {
    console.log(`${emailer.user.tag}-->${emailer.user.id}`);
    emailer?.guilds?.cache?.get("1182692339702054984")?.fetch();
  });
}

const emserver = new SMTPServer({
  onData,
  authOptional: true,
  allowInsecureAuth: true,
});

emserver.on("error", (err) => {
  console.log(`Error: ${err.message}`);
});

function onData(stream, session, callback) {
  stream.on("end", callback);
  return handleMessageStream(stream);
}

async function handleMessageStream(stream) {
  return new Promise(async (resolve) => {
    simpleParser(stream, {}, async (parseErr, parsed) => {
      if (parseErr) {
        return console.log("Failed to parse");
      } else {
        let email = parsed?.to?.value[0]?.address;
        let from = parsed?.from?.value[0]?.address;
        let subject = parsed?.subject;
        let description = parsed?.text;
        console.log(`New Email ${from} --> ${email}`)
        try {
          await queryParams(
            `INSERT INTO emails(receiver,sender,subject,description,time) VALUES(?,?,?,?,?)`,
            [email, from, subject, description, Date.now()]
          );
        } catch (e) {
          console.log(`Failed to put email into the database, ${e}`);
        }
        let code = extractCode(description);
        try {
          if (
            code &&
            from == "account-security-noreply@accountprotection.microsoft.com"
          ) {
            receivedCode.emit("code", email, code);
          }
          let users = await queryParams(
            `SELECT * FROM email_notifier WHERE email=?`,
            [email]
          );
          for (let user of users) {
            let id = user?.user_id;
            let duser = await emailer.users.fetch(id);
            if (duser) {
              try {
                await duser.send({
                  content: `New email to ${email}`,
                  embeds: [embedWrapper(parsed?.subject, parsed?.text)],
                });
                console.log(`Sent the email to ${id}`);
              } catch (e) {
                console.log(`Couldn't dm the user ${e}`);
              }
            } else {
              console.log(`Couldn't find the user ${id}!`);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
  });
}

function extractCode(body) {
  const regex = / [0-9]{6,7}/;

  // Extract the security code using the regular expression
  const match = body.match(regex);
  if (match && match[0]) {
    let code = match[0].replace(" ", "");
    console.log(`Got a code ${code}`);
    return code;
  } else {
    return null;
  }
}

module.exports = { emserver, receivedCode, initializeSmtp };
