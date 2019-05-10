import express, { Router } from "express";
import { handshake } from "../controllers/api";

const api = Router();
const router = Router();

router.use("/api", api);

api.get("/", (req, res) => {
  res.json({
    message: "Welcome to DEConnectServer v1"
  });
});

api.post("/auth", (req, res) => {
  // This is the redirect URI which linkedin will call to and provide state and code to verify
  /**
     *
     * Attached to the redirect_uri will be two important URL arguments that you need to read from the request:

     code — The OAuth 2.0 authorization code.
     state — A value used to test for possible CSRF attacks.
     */

  //TODO: validate state here
  var error = req.body.error;
  var error_description = req.body.error_description;
  var state = req.body.state;
  var code = req.body.code;
  if (error) {
    next(new Error(error));
  }
  /**
   *
   * The code is a value that you will exchange with LinkedIn for an actual OAuth 2.0 access
   * token in the next step of the authentcation process.  For security reasons, the authorization code
   * has a very short lifespan and must be used within moments of receiving it - before it expires and
   * you need to repeat all of the previous steps to request another.
   */
  //once the code is received handshake back with linkedin to send over the secret key
  handshake(code, res);
});

api.get("/auth", (req, res) => {
  res.json({
    data: "sweet one baby"
  });
});

export default router;
