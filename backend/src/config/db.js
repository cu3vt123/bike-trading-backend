import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mem;

export async function connectDb({ mongoUri }) {
  const uri = (mongoUri ?? "").trim();
  if (!uri) {
    mem = await MongoMemoryServer.create();
    const memUri = mem.getUri();
    await mongoose.connect(memUri, { dbName: "shopbike_demo" });
    return { uri: memUri, inMemory: true };
  }

  await mongoose.connect(uri);
  return { uri, inMemory: false };
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (mem) {
    await mem.stop();
    mem = undefined;
  }
}

