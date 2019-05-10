import express from "express";
import path from "path";
import logger from "morgan";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
const MongoStore = require("connect-mongo")(session);

import routes from "./routes";

dotenv.config();

const app = express();

// Connect to our Database and handle an bad connections
mongoose.connect(process.env.DATABASE, {
  useCreateIndex: true,
  useNewUrlParser: true
});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
const db = mongoose.connection

// Setup Express Session
app.use(
  session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db })
  })
);

app.use(
  logger("dev", {
    skip: () => app.get("env") === "test"
  })
);

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(morgan("dev"));

// Handling cors
app.use(
  cors({
    origin: "*"
  })
);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

// Routes
app.use("/", routes);

app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  res.status(err.status || 500).json({
    err: err.status,
    message: err.message
  });
});

export default app;
