import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb+srv://plantflow:PlantFlow%40SuperAdmin@cluster0.wsjka.mongodb.net/?retryWrites=true&w=majority";

(async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");
    const db = client.db("plantflow");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections);
    await client.close();
  } catch (error) {
    console.error("Connection error:", error);
  }
})();
