const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
const uploadToCloudflare = require("../utils/uploadToCloudflare.js");
const deleteFromCloudflare = require("../utils/deleteFromCloudflare.js");

const getAllProducts = async (req, res) => {
    try {

        const products = await Product.find();
        if (!products) {
            return res.status(404).json({ message: "Products Not Found!" });
        }

        return res.status(200).json({ message: "All Products Fetched Successfully", products });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}



const getAllPublishedProducts = async (req, res) => {
    try {

        const publishedProducts = await Product.find({ status: "Published" });
        if (!publishedProducts) {
            return res.status(404).json({ message: "Published Products Not Found!" });
        }


        return res.status(200).json({ message: "Published Products Fetched Successfully", publishedProducts });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}



const getAllUnpublishedProducts = async (req, res) => {
    try {

        const unpublishedProducts = await Product.find({ status: "Unpublished" });
        if (!unpublishedProducts) {
            return res.status(404).json({ message: "unpublished Products Not Found!" });
        }


        return res.status(200).json({ message: "unpublished Products Fetched Successfully", unpublishedProducts });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}


const addNewProduct = async (req, res) => {
    try {

        const {
            productName,
            productType,
            brandName,
            quantityStock,
            mrp,
            sellingPrice,
            exchangeEligibility,
        } = req.body;

        const userId = req.user.id;

        if (!productName || !productType || !brandName || !quantityStock || !mrp || !sellingPrice || !exchangeEligibility) {
            return res.status(400).json({ message: "All Fields are Required!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User Not Found!" });
        }

        let uploadedImages = [];

        if (req.files?.length > 0) {
            const uploadPromises = req.files.map((file) => {
                return uploadToCloudflare(file, "Products");
            })

            uploadedImages = await Promise.all(
                uploadPromises
            );

        }


        const newProduct = new Product({
            productName,
            productType,
            brandName,
            quantityStock,
            mrp,
            sellingPrice,
            exchangeEligibility,
            createdBy: user._id,
            images: uploadedImages,
        });

        await newProduct.save();


        return res.status(201).json({ message: "New Product Added Successfully.", newProduct });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}





const getProductDetails = async (req, res) => {
    try {

        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product Not Found!" });
        }

        return res.status(200).json({ message: "Product Details Fetched Successfully.", product });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}



const updateProduct = async (req, res) => {
    try {

        const productId = req.params.id;
        const {
            productName,
            productType,
            brandName,
            quantityStock,
            mrp,
            sellingPrice,
            exchangeEligibility,
            removedImages,
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product Not Found!" });
        }

        // Delete Removed Images

        if (removedImages) {
            const imagesToDelete = JSON.parse(removedImages);

            for (const key of imagesToDelete) {
                await deleteFromCloudflare(key);
            }

            product.images = product.images.filter((image) => (
                !imagesToDelete.includes(image.key)
            ));


        }


        // upload new images

        if (req.files?.length > 0) {
            const uploadPromises = req.files.map((file) => {
                return uploadToCloudflare(file, "Products");
            });

            const uploadedImages = await Promise.all(uploadPromises);

            product.images.push(...uploadedImages);

        }


        //Fields Updation

        if (productName) {
            product.productName = productName;
        }

        if (productType) {
            product.productType = productType;
        }

        if (brandName) {
            product.brandName = brandName;
        }

        if (quantityStock) {
            product.quantityStock = quantityStock;
        }

        if (mrp) {
            product.mrp = mrp;
        }

        if (sellingPrice) {
            product.sellingPrice = sellingPrice;
        }

        if (exchangeEligibility) {
            product.exchangeEligibility = exchangeEligibility;
        }


        await product.save();

        return res.status(200).json({ message: "Product Updated Successfully.", product });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}




const deleteProduct = async (req, res) => {
    try {

        const productId = req.params.id;

        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: "Product Not Found!" });
        }

        return res.status(200).json({ message: "Product Deleted Successfully." });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
}



const toggleStatus = async (req, res) => {
    try {

        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product Not Found!" });
        }

        if (product.status === "Published") {
            product.status = "Unpublished";
        } else {
            product.status = "Published";
        }

        await product.save();

        return res.status(200).json({ message: "Product Status Updated Successfully", product });

    } catch (err) {
        console.log(err);
        res.status(500).json("Server Error");
    }
}


module.exports = { getAllProducts, getAllPublishedProducts, getAllUnpublishedProducts, addNewProduct, getProductDetails, updateProduct, deleteProduct, toggleStatus };
