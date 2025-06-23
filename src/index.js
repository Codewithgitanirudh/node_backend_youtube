import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config({
  path: './.env',
});

connectDB()
  .then(() => {
    app.on('error', error => {
      console.log('Server is running on port 8000');
      console.log(error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.log('Error connecting to MongoDB', error);
    process.exit(1);
  });

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
