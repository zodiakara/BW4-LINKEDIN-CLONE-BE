import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import experiencesModel from "../experiences/model.js";
import q2m from "query-to-mongo";
import { getExperiences, writeExperiences } from "../../lib/fs-tools.js";
import mongoose from "mongoose";

const url = process.env.BE_URL;
const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    console.log(newUser);
    if (newUser) {
      const { _id } = await newUser.save();
      res.status(201).send({ _id });
      console.log(`user with id ${_id} successfully created!`);
    } else {
      next(createHttpError(400, `something went wrong`));
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
    const mongoQuery = q2m(req.query);
    console.log(req.query, mongoQuery);
    const total = await experiencesModel.countDocuments(mongoQuery.criteria);
    const experiences = await experiencesModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      experiences,
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/:userId/experiences/:experiencesId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId)
      if (user) {
      const singleExperiences = user.experiences.find((experience) => experience._id.toString() === req.params.experiencesId);
      res.status(200).send(singleExperiences);
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
    const newExperiences = {...req.body}; //
    if (newExperiences) {
    const updateUserExperience = await UsersModel.findByIdAndUpdate(req.params.userId, {$push: {experiences: newExperiences}}, {new: true, runValidators: true})
    res.status(201).send({ message: `Added a new experience.`, updateUserExperience });
    } else {
      next(createHttpError("Malakia ekanes!"))
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
        const index = user.experiences.findIndex((experience) => experience._id.toString() === req.params.experiencesId)
        const updatedexperiences = user.experiences[index].toObject()
      user.experiences[index] = {
        ...updatedexperiences,
        ...req.body
      }
      await user.save()
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
        req.params.userId, {$pull: {experiences: {_id: req.params.experiencesId}}}, {new: true}
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(createHttpError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;