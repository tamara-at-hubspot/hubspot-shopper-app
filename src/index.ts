import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import config from "./config";
import { useHome } from "./views/home";
import { useOauth } from "./controllers/oauthController";
import { useList } from "./controllers/listController";
import { useHub } from "./controllers/hubController";

const app = express();

app.use(cors());
app.use(
  bodyParser.json({
    limit: "10mb",
  }),
);
app.use(express.Router());
useHome(app);
useOauth(app, "/oauth");
useList(app, "/list");
useHub(app, "/hub");

app.listen(3000, () =>
  console.log(`Starting your app on ${config.env.APP_BASE_URL}`),
);
