import { MongoClient } from 'mongodb';

let cachedClient = null; // Cached MongoDB client for connection pooling

export async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient; // Return cached client if available
    }

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined. Please check your .env file.");
    }

    try {
        const client = new MongoClient(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        cachedClient = await client.connect(); // Cache the MongoDB client
        console.log("Connected to MongoDB");
        return cachedClient;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error; // Throw the error to be handled by the calling function
    }
}
