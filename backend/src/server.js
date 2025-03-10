import mongoose from "mongoose";
import express from "express";
import router from "./routes/router.js";
import morgan from "morgan";
import cors from "cors";

const app = express();
const PORT = 3000;

mongoose.connect("mongodb+srv://wilmerhy2005:ERPKNIGTH@crud-analisis.xa4ap.mongodb.net/")

app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));
app.use("/api",router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});