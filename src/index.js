import dotenv from "dotenv"
import express from "express";
import connectDB from "./db/index.js";
const app = express();

dotenv.config({
    path: "./.env.local"
})

connectDB()







// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error", (error) => {
//             console.log("Server is running on port 8000");
//             console.log(error);
//             throw error;
//         });
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//         console.log("Connected to MongoDB");
//     } catch (error) {
//         console.log("Error connecting to MongoDB", error);
//     }
// })();