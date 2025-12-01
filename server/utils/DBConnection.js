import mongoose from "mongoose";

export const DbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_String);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error.message);
  }
};
