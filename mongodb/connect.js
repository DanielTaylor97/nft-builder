const { MongoClient } = require("mongodb");
require("dotenv").config({path: "./config.env"});

const db = process.env.CONNECTION_STRING;
const client = new MongoClient(
    db,
    { tls: true, autoSelectFamily: false, autoSelectFamilyAttemptTimeout: 3000 }
);

let database;

module.exports = {
    connect: () => {
        database = client.db("AuthensusApp");
    },
    getDb: () => {
        return database;
    }
}
