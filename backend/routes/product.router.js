const express = require("express");
const productRouter = express.Router();
const uploadImage = require("../middleware/uploadProductImage.js");

const isAuthenticated = require("../middleware/authMiddleware.js");

const { getAllProducts, getAllPublishedProducts, getAllUnpublishedProducts, addNewProduct, getProductDetails, updateProduct, deleteProduct, toggleStatus } = require("../controllers/productController.js");


productRouter.get("/AllProducts", isAuthenticated, getAllProducts);
productRouter.get("/published-products", isAuthenticated, getAllPublishedProducts);
productRouter.get("/unpublished-products", isAuthenticated, getAllUnpublishedProducts);

productRouter.post("/product/new", uploadImage.array("images", 5), isAuthenticated, addNewProduct);
productRouter.get("/product/:id", isAuthenticated, getProductDetails);
productRouter.put("/product/edit/:id", uploadImage.array("images", 5), isAuthenticated, updateProduct);
productRouter.delete("/product/delete/:id", isAuthenticated, deleteProduct);
productRouter.patch("/product/toggle-status/:id", isAuthenticated, toggleStatus);

module.exports = productRouter;