import createHttpError from "http-errors";
import { verifyAccessToken } from "./jwt-tools.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "please provide bearer token in the authorization header!!"
      )
    );
  } else {
    try {
      const accessToken = req.headers.authorization.replace("Bearer ", "");
      const payload = await verifyAccessToken(accessToken);
      req.user = {
        _id: payload._id,
      };
      next();
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "token not valid!!"));
    }
  }
};
