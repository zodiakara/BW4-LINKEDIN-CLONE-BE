import mongoose from "mongoose";

const { Schema, model } = mongoose;
// ----
const postsSchema = new Schema(
  {
    text: { type: String, required: true },
    username: { type: String },
    image: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model("Post", postsSchema);
