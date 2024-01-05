import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const deleteFile = async (localFilePath) => {
  try {
    console.log("local path",localFilePath)
    if(!localFilePath) return null
    //delete the file on cloudinary
    const response = await cloudinary.uploader.destroy
    (localFilePath)
    console.log("Final res:",response)
    fs.unlinkSync(localFilePath)
    // return response;
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temp file as the delete operation got failed
    return null
  }
}

export { deleteFile }

// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });