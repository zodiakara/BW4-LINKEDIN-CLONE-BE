import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import json2csv from "json2csv";
import UsersModel from "../users/model.js";
import { Readable } from "stream";

const filesRouter = express.Router();

filesRouter.get("/:userId/experiences/downloadCSV", async (req, res, next) => {
  try {
    const userCSV = await UsersModel.findById(req.params.userId);
    const experiences = userCSV.experiences;
    const source = new Readable({
      read() {
        this.push(JSON.stringify(experiences));
        this.push(null);
      },
    });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=experiences.csv"
    );

    const transform = new json2csv.Transform({
      fields: ["role", "company", "description", "area"],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default filesRouter;