import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { useOauth } from "./controllers/oauth";
import { useHome } from "./views/home";
import config from "./config";

const app = express();

app.use(cors());
app.use(
  bodyParser.json({
    limit: "10mb",
  }),
);
app.use(express.Router());
useOauth(app, "/oauth");
useHome(app);

app.listen(3000, () =>
  console.log(`Starting your app on ${config.env.APP_BASE_URL}`),
);
