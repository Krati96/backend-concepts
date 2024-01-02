import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        const connectionInst = await 
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Mongodb connected !! DB Host: ${connectionInst.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error ", error);
        process.exit(1);  // need to learn more about process exit function to know more about variouse exit code 1, 0 , etc
    }
}

export default connectDB