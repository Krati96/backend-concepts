import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("local path",localFilePath)
    if(!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    //file has been uploaded successfully
    // console.log("File is uploaded successfully", response?.url)
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload operation got failed
    return null
  }
}

const deleteOnClodinary = async (url) =>{
  try {
    if(!url) return null
    await cloudinary.api.delete_resources([url],
      {
        type: 'upload',
        resource_type: "auto"
      }).then(console.log);
  } catch (error) {
    console.log(error)
  }
}

export { uploadOnCloudinary, deleteOnClodinary }

// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });