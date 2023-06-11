import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import mongoose from "mongoose";

const educationRouter = express.Router();

educationRouter.get("/:userId/education", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user.education);
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

educationRouter.post("/:userId/education", async (req, res, next) => {
  try {
    const newEd = { ...req.body };
    if (newEd) {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $push: { education: newEd } },
        { new: true, runValidators: true }
      );
      res.status(201).send({ message: "education added", updatedUser });
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

educationRouter.get(
  "/:userId/education/:educationId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      const singleEd = user.education.find(
        (ed) => ed._id.toString() === req.params.educationId
      );
      res.send(singleEd);
    } catch (error) {
      next(error);
    }
  }
);

educationRouter.put(
  "/:userId/education/:educationId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const index = user.education.findIndex(
          (ed) => ed._id.toString() === req.params.educationId
        );
        const updatedEd = user.education[index].toObject();
        user.education[index] = {
          ...updatedEd,
          ...req.body,
        };
        await user.save();
        res.status(200).send(user.education);
      } else {
        next(
          createHttpError(404, `user with id ${req.params.userId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
educationRouter.delete(
  "/:userId/education/:educationId",
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $pull: { education: { _id: req.params.educationId } } },
        { new: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          next(
            createHttpError(404, `user with id ${req.params.userId} not found`)
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default educationRouter;
