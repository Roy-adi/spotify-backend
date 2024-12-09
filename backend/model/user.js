import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    clerkId: {
      type: String,
      unique: true,
      default: null,
    },
    username: {
      type: String,
      unique: true,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    email:{
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
