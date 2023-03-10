import mongoose from "mongoose";

const { Schema, model } = mongoose;

const experienceSchema = new Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    description: { type: String, required: true },
    area: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String },
    title: { type: String },
    area: { type: String },
    image: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
    },
    username: { type: String, required: true },
    experiences: [experienceSchema],
    likedPosts: [{ type: String }],
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    connections: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: Schema.Types.ObjectId, ref: "Connection" }],
    receivedRequests: [{ type: Schema.Types.ObjectId, ref: "Connection" }],
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
