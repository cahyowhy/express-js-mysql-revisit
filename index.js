import { errorHandler, queryParserHandler } from "./src/middleware";
import express from "express";
import routes from "./src/route";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const port = process.env.PORT || 2500;
app.listen(port, function () {
    console.log(`app are running on port ${port}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(queryParserHandler);
app.use("/api", routes);
app.use(errorHandler);

process.on('uncaughtException', function (error) {
    if (process.env.DEV) console.log(error);
    
    process.exit(1000);
});