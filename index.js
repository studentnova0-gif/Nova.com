import { MongoClient } from "mongodb";

const url = "YOUR_MONGODB_CONNECTION_STRING";

const client = new MongoClient(url);

const dbname = "pargramming_knowledge";

async function main() {
    try {
        await client.connect();

        console.log("MongoDB connected successfully!");

        const db = client.db(dbname);

        console.log("Database selected:", dbname);

    } catch (error) {
        console.error("MongoDB connection error:", error);
    } finally {
        await client.close();
    }
}

main();