import mongoose from "mongoose";

const { Schema, model } = mongoose;
// ----
const postsSchema = new Schema(
  {
    text: { type: String, required: true },
    image: { type: String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model("Post", postsSchema);
