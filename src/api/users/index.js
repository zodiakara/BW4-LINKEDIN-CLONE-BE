import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import createCVPdf from "../../lib/pdf-tools.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtMiddleware.js";
import { createAccessToken, createTokens } from "../../lib/auth/jwt-tools.js";

const usersRouter = express.Router();

const url = process.env.secure_url;

const experienceCloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "LINKEDIN-CLONE-BE/public/imgs",
      public_id: (req) => req.params.experienceId,
    },
  }),
}).single("experience");

const userProfileCloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "BW4-LINKEDIN-CLONE-BE/users",
    },
  }),
}).single("avatar");

// USER ROUTER:

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const checkUsername = await UsersModel.findOne({
      username: newUser.username,
    });
    if (checkUsername) {
      next(createHttpError(400, "username already in use!"));
    } else {
      const { _id } = await newUser.save();
      res.status(201).send({ _id });
      console.log(`user with id ${_id} successfully created!`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    if (users) {
      res.send(users);
    } else {
      next(createHttpError(404, `users not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

//login
usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    console.log(user);
    if (user) {
      const { accessToken, refreshToken } = await createTokens(user);
      console.log(user);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(404, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

//register:
usersRouter.post("/register", async (req, res, next) => {
  try {
    //first email check
    const { email } = req.body;
    const user = await UsersModel.checkEmail(email);
    if (user) {
      next(createHttpError(409, `This email has already been used!`));
    } else {
      const newUser = new UsersModel(req.body);
      const { _id } = await newUser.save();
      const payload = { _id };
      const accessToken = await createAccessToken(payload);
      res.status(201).send({ accessToken });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId}not found!!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId}not found!!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId}not found!!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// USER EXPERIENCES CRUD:

usersRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    // const mongoQuery = q2m(req.query);
    // console.log(req.query, mongoQuery);
    // const total = await user.experiences.countDocuments(mongoQuery.criteria);
    // const experiences = await experiencesModel
    //   .find(mongoQuery.criteria, mongoQuery.options.fields)
    //   .sort(mongoQuery.options.sort)
    //   .skip(mongoQuery.options.skip)
    //   .limit(mongoQuery.options.limit);
    // res.status(200).send({
    //   links: mongoQuery.links(total),
    //   total,
    //   totalPages: Math.ceil(total / mongoQuery.options.limit),
    //   experiences,
    // });
    if (user) {
      res.send(user.experiences);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId}not found!!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/:userId/experiences/:experiencesId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const singleExperiences = user.experiences.find(
          (experience) => experience._id.toString() === req.params.experiencesId
        );
        res.send(singleExperiences);
      } else {
        next(createHttpError(404, "experiences Not Found"));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const newExperiences = { ...req.body }; //
    if (newExperiences) {
      const updateUserExperience = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $push: { experiences: newExperiences } },
        { new: true, runValidators: true }
      );
      res
        .status(201)
        .send({ message: `Added a new experience.`, updateUserExperience });
    } else {
      next(createHttpError("Malakia ekanes!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put(
  "/:userId/experiences/:experiencesId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const index = user.experiences.findIndex(
          (experience) => experience._id.toString() === req.params.experiencesId
        );
        const updatedExperiences = user.experiences[index].toObject();
        user.experiences[index] = {
          ...updatedExperiences,
          ...req.body,
        };
        await user.save();
        res.status(200).send(user);
      } else {
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/:userId/experiences/:experiencesId",
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $pull: { experiences: { _id: req.params.experiencesId } } },
        { new: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// print user CV:

usersRouter.get("/:userId/printCV", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      await createCVPdf(req.params.userId, user, res);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST EXPERIENCE IMAGE

usersRouter.post(
  "/:userId/experiences/:experienceId/image",
  experienceCloudinaryUploader,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const selectedExperienceIndex = user.experiences.findIndex(
          (experience) => experience._id.toString() === req.params.experienceId
        );
        if (selectedExperienceIndex !== -1) {
          cloudinary.uploader
            .upload(url, {
              public_id: req.params.experienceId,
              tags: "experience_image",
            })
            .then((result) => {
              const imageUrl = result.url;
              user.experiences[selectedExperienceIndex].image = imageUrl;
              user.save({ validateBeforeSave: false }).then(() => {
                res.send(user);
              });
            })
            .catch((error) => {
              console.log(error);
              next(error);
            });
        } else {
          next(
            createHttpError(
              404,
              `Experience with id ${req.params.experienceId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// POST USER IMAGE

usersRouter.post(
  "/:userId/uploadAvatar",
  userProfileCloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log(req.file);
      const imageUrl = req.file.path;
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { image: imageUrl },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send("file uploaded!");
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
