const discord = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const { token } = require("./config.json");
const { SMTPServer } = require("smtp-server");
const { initializeDB, queryParams } = require("./db/db");
const { simpleParser } = require("mailparser");
const embedWrapper = require("./utils/embedWrapper");




const emserver = new SMTPServer({
    onData,
    authOptional: true,
    allowInsecureAuth: true,
});


initializeDB().then(()=>{
    console.log(`Setup DB`)
})






const emailer = new discord.Client({
    intents: ["Guilds", "GuildMessages"], // Adding intents,
    presence: {
        activities: [
            {
                name: "Manager",
                type: discord.ActivityType.Custom,
                state: "Reading Emails",
            },
        ],
        status: "dnd",
    },
});
eventHandler(emailer, token);
emailer.login(token)


emserver.listen(25, "0.0.0.0", () => {
    console.log(`SMTP listening on 25`);
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
                try {
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


