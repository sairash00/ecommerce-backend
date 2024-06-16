const cloudinary = require("cloudinary").v2
const fs = require("fs")



cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME_CLOUDINARY , 
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret : process.env.API_SECRET_CLOUDINARY
});


const uploadOnCloudinary = async (filepaths) => {
    try { 
       
        if (!Array.isArray(filepaths)) {
            filepaths = [filepaths];
        }

        const responses = [];
        for (const filepath of filepaths) {
            const response = await cloudinary.uploader.upload(filepath, {
                resource_type: "auto"
            });

            fs.unlinkSync(filepath);

            responses.push(response.secure_url);
        }

        return responses;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
}

module.exports = uploadOnCloudinary;
