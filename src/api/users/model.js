import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    password: { type: String, required: true },
    bio: { type: String },
    title: { type: String },
    area: { type: String },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
    },
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

userSchema.pre("save", async function (next) {
  const currentUser = this;
  if (currentUser.isModified("password")) {
    const plainPW = currentUser.password;
    const hash = await bcrypt.hash(plainPW, 10);
    currentUser.password = hash;
  }
  next();
});
userSchema.methods.toJSON = function () {
  const userDocument = this;
  const user = userDocument.toObject();

  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.__v;
  delete user.refreshToken;

  return user;
};

userSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (passwordCheck) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

userSchema.static("checkEmail", async function (email) {
  const user = await this.findOne({ email });
  if (user) {
    return email;
  } else {
    return null;
  }
});

export default model("User", userSchema);
