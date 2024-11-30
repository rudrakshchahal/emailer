const sqlite = require("sqlite3").verbose();
const { join } = require("path");
const path = join(__dirname, "database.db");

// Connect to database
const db = new sqlite.Database(path, (err) => {
  if (err) throw err;
});

const queryParams = (command, params, method = "all") => {
  return new Promise((resolve, reject) => {
    db[method](command, params, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result, this);
      }
    });
  });
};

// Any object that get added to queries will get run automatically upon starting the server

let queries = {
  emailNotifier: `CREATE TABLE if not exists email_notifier(user_id TEXT,email TEXT);`,
  emails: `CREATE TABLE if not exists emails(id INTEGER PRIMARY KEY,sender TEXT,receiver TEXT,subject TEXT,description TEXT,time TEXT,ip TEXT)`,
};

async function initializeDB() {
  if (db) {
    for (let query of Object.values(queries)) {
      try {
        await db.run(query, [], (err) => {
          if (err) return console.log(err.message);
        });
      } catch (err) {
        return console.error(err);
      }
    }
  } else {
    console.log(`You need to connect to the database first`);
  }
}

module.exports = { initializeDB, queryParams };
