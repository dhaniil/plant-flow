import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbName = process.env.MONGO_DB;
const collectionName = process.env.MONGO_COLLECTION;

async function create(data) {
    try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    console.log(`Data baru: ${result.insertedId}`);
    } catch (error) {
    console.error(`gagal untuk membuat data baru: ${error}`);
    }
}

async function read(data) {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const plants = await collection.find(data).toArray();
        console.log('Plants:', plants);
    } catch (error) {
        console.error(`gagal untuk membaca data: ${error}`);
    }   
}

async function update(data, newData) {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(data, { $set: newData });
        console.log(`Data yang diupdate: ${result.modifiedCount}`);
    } catch (error) {
        console.error(`gagal untuk mengupdate data: ${error}`);
    }
}

async function remove(data) {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne(data);
        console.log(`Data yang dihapus: ${result.deletedCount}`);
    } catch (error) {
        console.error(`gagal untuk menghapus data: ${error}`);
    }
}

export { client, create, read, update, remove };