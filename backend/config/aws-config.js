const { S3Client } = require("@aws-sdk/client-s3");
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const S3_BUCKET = "productr-bucket";

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
});

module.exports = { s3, S3_BUCKET };
