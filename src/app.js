import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cookieParser());

//routes imports
import userRoutes from "./routes/user.routes.js";

//routes
app.use("/api/v1/users", userRoutes);

export default app;