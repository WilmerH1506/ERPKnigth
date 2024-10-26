import mongoose from "mongoose";
import express from "express";
import router from "./routes/router.js";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config();
const app = express();
const PORT = 3000;


mongoose.connect("mongodb+srv://wilmerhy2005:clinica123@crud-analisis.xa4ap.mongodb.net/?retryWrites=true&w=majority&appName=CRUD-Analisis")

app.use(cors({ origin: 'http://localhost:4000'}));
app.use(express.json());
app.use(morgan('dev'));
app.use("/api",router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});