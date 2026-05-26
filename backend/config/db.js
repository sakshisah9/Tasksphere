import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Copy .env.example to .env and fill it in.");
  }

  if (process.env.NODE_ENV === "production" && /127\.0\.0\.1|localhost/.test(mongoUri)) {
    throw new Error("MONGO_URI is still pointing to localhost in production. Set it to your MongoDB Atlas connection string in Render.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}
