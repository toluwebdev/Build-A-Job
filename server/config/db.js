import mongoose from "mongoose";
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log("MongoDB connection error: " + error);
    process.exit(1);
  }
};

export default connectDB;
