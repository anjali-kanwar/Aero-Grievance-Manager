import express from "express";
import { connectDB } from "./config/db.js";
import dns from "dns";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import grievanceRoutes from "./routes/grievanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";


dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();
const PORT=process.env.PORT || 3000;
const __dirname=path.resolve();

if(process.env.NODE_ENV!=="production") {
    app.use(
        cors({
            origin: "http://localhost:5173",
        })
    );
}

//middleware
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/grievances", grievanceRoutes);

if(process.env.NODE_ENV==="production")  {
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("*",(req,res) => {
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
});
}

connectDB().then(() => {
    app.listen(PORT, () => {
    console.log("Server started on PORT: ",PORT);
});
});