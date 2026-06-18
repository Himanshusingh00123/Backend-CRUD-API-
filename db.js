const mongo = require("mongodb").MongoClient;
const Mongo_URL = process.env.MongoDB_URL;
let db;

const connectdb = async () => {
  try {
    if (db) {
      return db;
    }
    const client = new mongo(Mongo_URL);
    await client.connect();
    console.log("database is connected ");
    db = client.db("mydb");
    db.createCollection("user");
    return db;
  } catch (error) {
    console.log("databse is not connected");
    throw error;
  }
};

module.exports = { connectdb };
