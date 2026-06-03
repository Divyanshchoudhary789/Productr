const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({
    productName: {
        type: String,
        required: true
    },

    productType: {
        type: String,
        required: true,
        enum: ["Foods", "Electronics", "Clothes", "Beauty Products", "Others"]
    },

    brandName: {
        type: String,
        required: true,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    quantityStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },

    mrp: {
        type: Number,
        required: true,
        min: 0
    },

    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    images: [
        {
            url: {
                type: String,
                required: true,
            },
            key: {
                type: String,
                default: ""
            }
        }
    ],

    exchangeEligibility: {
        type: String,
        enum: ["Yes", "No"],
        default: "Yes"
    },

    status: {
        type: String,
        enum: ["Published", "Unpublished"],
        default: "Published",
    },

}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);

module.exports = Product;