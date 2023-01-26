import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import usersRouter from "./api/users/index.js";
import postsRouter from "./api/posts/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import filesRouter from "./api/files/index.js";

const server = express();
const port = process.env.PORT;

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

// const corsOpts = {
//   origin: (origin, corsNext) => {
//     console.log("Current origin: " + origin);
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       corsNext(null, true);
//     } else {
//       corsNext(createHttpError(400, `Origin ${origin} is not allowed`));
//     }
//   },
// };

server.use(cors());
server.use(express.json());

server.use("/posts", postsRouter);
server.use("/users", usersRouter);
server.use("/files", filesRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
