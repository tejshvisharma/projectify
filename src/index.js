import dotenv from "dotenv";
import connectDB from "./db/dbConnect.js";
dotenv.config({ path: "C:/Users/ojshv/OneDrive/Desktop/projectify/.env" });

// import  express app from  app.js file
import app  from "./app.js";


// Connect to MongoDB
connectDB();



// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
