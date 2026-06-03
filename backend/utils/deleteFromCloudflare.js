const { s3 } = require("../config/aws-config.js");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");


const deleteFromCloudflare = async (key) => {

    if (!key) {
        return;
    }

    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
    });

    await s3.send(command);

}


module.exports = deleteFromCloudflare;