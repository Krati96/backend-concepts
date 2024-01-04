// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then( ()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);
    })

    app.on("error",(error) =>{
        console.log("Error found at connection : ",error);
        throw error;
    })
})
.catch((err)=> {
    console.log("MONGODB connection failed !!", err);
})

/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import { Express } from "express";
const app = express();
( async ()=> {
    try{
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error",(error) =>{
            console.log("Error found:",error)
            throw error
        })
        app.listen(process.env.PORT, ()=> {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    }catch(error){
        console.error("Error found:",error)
        throw error
    }
})()
*/