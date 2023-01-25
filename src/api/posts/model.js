import mongoose from "mongoose";

const { Schema, model } = mongoose;
// ----
const postsSchema = new Schema(
  {
    text: { type: String, required: true },
    username: { type: String, required: true },
    image: { data: Buffer, contentType: String },
    user: {
      name: { type: String, required: true },
      surname: { type: String, required: true },
      email: { type: String, required: true },
      bio: { type: String },
      title: { type: String },
      area: { type: String },
      image: { type: String },
      username: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default model("Post", postsSchema);
