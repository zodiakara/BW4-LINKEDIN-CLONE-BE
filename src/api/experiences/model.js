import { Schema, model } from "mongoose";

export const experiencesDbSchema = new Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      required: false,
    },
  },
  { timestamps: true }
);

export default model("Experiences", experiencesDbSchema);
