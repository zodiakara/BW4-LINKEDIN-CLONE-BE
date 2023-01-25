import express from "express";
import createHttpError from "http-errors";
import PostModel from "./model.js";
import q2m from "query-to-mongo";
import { mongo } from "mongoose";
import UserSchema from "../users/model.js";

const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await PostModel.countDocuments(mongoQuery.criteria);
    const posts = await PostModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3001/posts", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    next(error);
  }
});

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId).populate({
      path: "user",
      select: "name surname image",
    });
    if (post) {
      res.send(post);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:postId", async (req, res, next) => {
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletedPost = await PostModel.findByIdAndDelete(req.params.postId);
    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        next(
          createHttpError(404, `Post with id ${req.params.postId} not found!`)
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// -----------Embedded------------------------

postsRouter.post("/:postId/user", async (req, res, next) => {
  try {
    const users = await UserSchema.findById(req.body.userId, { _id: 0 });
    if (users) {
      const userToInsert = { ...users.toObject() };
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { $push: { user: userToInsert } },
        { new: true, runValidators: true }
      );
      if (updatedPost) {
        res.send(updatedPost);
      } else {
        next(
          createHttpError(404, `Post with id ${req.params.postId} not found!`)
        );
      }
    } else {
      next(createHttpError(404, `User with id ${req.body.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default postsRouter;
