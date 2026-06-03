const multer = require("multer");
const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        //Images
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only Images are allowed", false));
    }


};


const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, //10MB
    }
});


module.exports = uploadImage;