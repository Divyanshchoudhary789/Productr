import { useEffect, useMemo, useState } from "react";
import {
    Check,
    ChevronDown,
    Loader2,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import { api } from "../environment";

const productTypes = ["Foods", "Electronics", "Clothes", "Beauty Products", "Others"];

const emptyForm = {
    productName: "",
    productType: "",
    quantityStock: "",
    mrp: "",
    sellingPrice: "",
    brandName: "",
    imageFiles: [],
    imagePreviews: [],
    existingImages: [],
    exchangeEligibility: "Yes",
};

const fieldClass =
    "h-10 w-full rounded-[6px] border border-[#d7dce5] bg-white px-3 text-[13px] text-[#31405a] outline-none placeholder:text-[#a8b0c1] focus:border-[#111aa5] focus:ring-1 focus:ring-[#111aa5]/30";

export default function Dashboard() {
    const [activePage, setActivePage] = useState("products");
    const [activeStatusTab, setActiveStatusTab] = useState("Published");
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [productModal, setProductModal] = useState({ open: false, mode: "add", product: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
    const [form, setForm] = useState(emptyForm);
    const [typeOpen, setTypeOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formMessage, setFormMessage] = useState("");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        let ignore = false;

        api.get("/AllProducts")
            .then((response) => {
                if (!ignore) {
                    setProducts(response.data.products || []);
                }
            })
            .catch((error) => {
                console.error(error);
                if (!ignore) {
                    setProducts([]);
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!toast) {
            return undefined;
        }

        const timer = window.setTimeout(() => setToast(null), 3000);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const searchedProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return products;
        }

        return products.filter((product) =>
            [
                product.productName,
                product.productType,
                product.brandName,
                product.status,
            ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [products, searchTerm]);

    const visibleProducts = useMemo(() => {
        if (activePage !== "home") {
            return searchedProducts;
        }

        return searchedProducts.filter((product) => {
            const status = product.status || "Published";
            return status === activeStatusTab;
        });
    }, [activePage, activeStatusTab, searchedProducts]);

    const openAddModal = () => {
        setForm(emptyForm);
        setTypeOpen(false);
        setFormMessage("");
        setProductModal({ open: true, mode: "add", product: null });
    };

    const openEditModal = (product) => {
        setForm({
            productName: product.productName || "",
            productType: product.productType || "",
            quantityStock: product.quantityStock || "",
            mrp: product.mrp || "",
            sellingPrice: product.sellingPrice || "",
            brandName: product.brandName || "",
            imageFiles: [],
            imagePreviews: [],
            existingImages: product.images || [],
            exchangeEligibility: product.exchangeEligibility || "Yes",
        });
        setTypeOpen(false);
        setFormMessage("");
        setProductModal({ open: true, mode: "edit", product });
    };

    const closeProductModal = () => {
        form.imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        setProductModal({ open: false, mode: "add", product: null });
        setForm(emptyForm);
        setTypeOpen(false);
        setFormMessage("");
    };

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleFiles = (event) => {
        const files = Array.from(event.target.files || []);
        const previews = files.map((file) => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            url: URL.createObjectURL(file),
        }));

        setForm((current) => ({
            ...current,
            imageFiles: [...current.imageFiles, ...files],
            imagePreviews: [...current.imagePreviews, ...previews],
        }));
        event.target.value = "";
    };

    const removeNewPreview = (id) => {
        setForm((current) => {
            const preview = current.imagePreviews.find((item) => item.id === id);
            if (preview) {
                URL.revokeObjectURL(preview.url);
            }

            return {
                ...current,
                imagePreviews: current.imagePreviews.filter((item) => item.id !== id),
                imageFiles: current.imagePreviews
                    .filter((item) => item.id !== id)
                    .map((item) => item.file),
            };
        });
    };

    const removeExistingImage = (keyOrUrl) => {
        setForm((current) => ({
            ...current,
            existingImages: current.existingImages.filter(
                (image) => (image.key || image.url) !== keyOrUrl
            ),
        }));
    };

    const buildPayload = () => {
        const payload = new FormData();
        payload.append("productName", form.productName);
        payload.append("productType", form.productType);
        payload.append("quantityStock", form.quantityStock);
        payload.append("mrp", form.mrp);
        payload.append("sellingPrice", form.sellingPrice);
        payload.append("brandName", form.brandName);
        payload.append("exchangeEligibility", form.exchangeEligibility);

        form.imageFiles.forEach((file) => payload.append("images", file));

        if (productModal.mode === "edit" && productModal.product?.images?.length) {
            const kept = new Set(form.existingImages.map((image) => image.key || image.url));
            const removed = productModal.product.images
                .filter((image) => !kept.has(image.key || image.url))
                .map((image) => image.key)
                .filter(Boolean);

            if (removed.length) {
                payload.append("removedImages", JSON.stringify(removed));
            }
        }

        return payload;
    };

    const submitProduct = async (event) => {
        event.preventDefault();

        if (!form.productType) {
            setFormMessage("Please select product type.");
            return;
        }

        setSaving(true);
        setFormMessage("");

        try {
            if (productModal.mode === "edit") {
                const response = await api.put(
                    `/product/edit/${productModal.product._id}`,
                    buildPayload()
                );
                const updated = response.data.product;
                setProducts((current) =>
                    current.map((product) =>
                        product._id === productModal.product._id ? updated : product
                    )
                );
                setToast({ type: "success", message: "Product updated Successfully" });
            } else {
                const response = await api.post("/product/new", buildPayload());
                setProducts((current) => [response.data.newProduct, ...current]);
                setToast({ type: "success", message: "Product added Successfully" });
            }

            closeProductModal();
        } catch (error) {
            console.error(error);
            setFormMessage(
                error.response?.data?.message ||
                `Product ${productModal.mode === "edit" ? "update" : "create"} failed. Please try again.`
            );
            setToast({
                type: "error",
                message: `Product ${productModal.mode === "edit" ? "update" : "create"} failed`,
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (product) => {
        const nextStatus = (product.status || "Published") === "Published" ? "Unpublished" : "Published";
        const previousStatus = product.status || "Published";

        setProducts((current) =>
            current.map((item) =>
                item._id === product._id ? { ...item, status: nextStatus } : item
            )
        );

        try {
            const response = await api.patch(`/product/toggle-status/${product._id}`);
            setProducts((current) =>
                current.map((item) =>
                    item._id === product._id ? response.data.product : item
                )
            );
        } catch (error) {
            console.error(error);
            setProducts((current) =>
                current.map((item) =>
                    item._id === product._id ? { ...item, status: previousStatus } : item
                )
            );
            setToast({ type: "error", message: "Product status update failed" });
        }
    };

    const confirmDelete = async () => {
        const product = deleteModal.product;
        if (!product) {
            return;
        }

        try {
            await api.delete(`/product/delete/${product._id}`);
            setProducts((current) => current.filter((item) => item._id !== product._id));
            setDeleteModal({ open: false, product: null });
            setToast({ type: "success", message: "Product Deleted Successfully" });
        } catch (error) {
            console.error(error);
            setToast({ type: "error", message: "Product delete failed" });
        }
    };

    const showTopSearch = productModal.open || deleteModal.open || products.length > 0;

    return (
        <div className="flex h-screen overflow-hidden bg-white text-[#26324a]">
            <Sidebar
                activePage={activePage}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onPageChange={setActivePage}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar
                    title="Products"
                    showTitle={activePage === "products"}
                    showSearch={showTopSearch}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="min-h-0 flex-1 overflow-y-auto bg-white">
                    {activePage === "home" && (
                        <HomeTabs
                            activeStatusTab={activeStatusTab}
                            onTabChange={setActiveStatusTab}
                        />
                    )}

                    {loading ? (
                        <div className="flex h-full min-h-[520px] items-center justify-center text-[#08107d]">
                            <Loader2 className="animate-spin" size={34} />
                        </div>
                    ) : visibleProducts.length === 0 ? (
                        <EmptyState
                            activePage={activePage}
                            activeStatusTab={activeStatusTab}
                            hasSearch={searchTerm.trim().length > 0}
                            onAdd={openAddModal}
                        />
                    ) : (
                        <ProductBoard
                            products={visibleProducts}
                            onAdd={openAddModal}
                            onEdit={openEditModal}
                            onDelete={(product) => setDeleteModal({ open: true, product })}
                            onToggleStatus={toggleStatus}
                        />
                    )}
                </main>
            </div>

            {productModal.open && (
                <ProductModal
                    mode={productModal.mode}
                    form={form}
                    typeOpen={typeOpen}
                    saving={saving}
                    message={formMessage}
                    onFieldChange={updateField}
                    onTypeToggle={() => setTypeOpen((value) => !value)}
                    onTypeSelect={(type) => {
                        setForm((current) => ({ ...current, productType: type }));
                        setTypeOpen(false);
                    }}
                    onFiles={handleFiles}
                    onRemovePreview={removeNewPreview}
                    onRemoveExisting={removeExistingImage}
                    onClose={closeProductModal}
                    onSubmit={submitProduct}
                />
            )}

            {deleteModal.open && (
                <DeleteModal
                    product={deleteModal.product}
                    onClose={() => setDeleteModal({ open: false, product: null })}
                    onDelete={confirmDelete}
                />
            )}

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}

function HomeTabs({ activeStatusTab, onTabChange }) {
    return (
        <div className="flex h-[48px] items-end gap-7 border-b border-[#e2e5ed] px-6">
            {["Published", "Unpublished"].map((tab) => (
                <button
                    key={tab}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className={`h-full border-b-2 px-0 text-[13px] font-medium ${activeStatusTab === tab
                        ? "border-[#1778ff] text-[#15203b]"
                        : "border-transparent text-[#7e889a]"
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}

function EmptyState({ activePage, activeStatusTab, hasSearch, onAdd }) {
    const homeTitle = `No ${activeStatusTab} Products`;
    const productTitle = hasSearch ? "No products match your search" : "Feels a little empty over here...";

    return (
        <div className="flex h-full min-h-[620px] items-center justify-center px-5">
            <div className="mb-[38px] flex w-full max-w-[360px] flex-col items-center text-center">
                <EmptyIcon />

                <h2 className="mt-[24px] text-[18px] font-bold text-[#27334a]">
                    {activePage === "home" ? homeTitle : productTitle}
                </h2>
                <p className="mt-3 max-w-[330px] text-[13px] leading-[18px] text-[#9aa5b8]">
                    {activePage === "home"
                        ? `Your ${activeStatusTab} Products will appear here Create your first product to publish`
                        : hasSearch
                            ? "Try a different product name, brand, type, or status."
                            : "You can create products without connecting store you can add products to store anytime"}
                </p>

                {activePage === "products" && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="mt-6 h-10 w-full max-w-[292px] rounded-[6px] bg-[#1424ea] text-[13px] font-bold text-white shadow-sm transition hover:bg-[#0f1fc8]"
                    >
                        Add your Products
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyIcon() {
    return (
        <div className="grid grid-cols-2 gap-[9px] text-[#071075]">
            <span className="h-[23px] w-[23px] rounded-[4px] border-[5px] border-current" />
            <span className="h-[23px] w-[23px] rounded-[4px] border-[5px] border-current" />
            <span className="h-[23px] w-[23px] rounded-[4px] border-[5px] border-current" />
            <span className="flex h-[23px] w-[23px] items-center justify-center">
                <Plus size={31} strokeWidth={4.2} />
            </span>
        </div>
    );
}

function ProductBoard({ products, onAdd, onEdit, onDelete, onToggleStatus }) {
    return (
        <section className="px-5 py-6 sm:px-7 xl:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h1 className="text-[20px] font-bold text-[#31405a]">Products</h1>
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-2 text-[18px] font-medium text-[#31405a] hover:text-[#101bb6]"
                >
                    <Plus size={17} strokeWidth={1.8} />
                    Add Products
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onEdit={() => onEdit(product)}
                        onDelete={() => onDelete(product)}
                        onToggleStatus={() => onToggleStatus(product)}
                    />
                ))}
            </div>
        </section>
    );
}

function ProductCard({ product, onEdit, onDelete, onToggleStatus }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const status = product.status || "Published";
    const images = product.images || [];
    const activeImage = images[activeImageIndex] || images[0];
    const primaryImage = activeImage?.url;
    const type = product.productType === "Foods" ? "Food" : product.productType;
    const imageCount = images.length;
    const publishAction = status === "Published" ? "Unpublish" : "Publish";

    return (
        <article className="w-full rounded-[12px] border border-[#dde2ea] bg-white p-4 shadow-[0_3px_14px_rgba(30,39,64,0.14)] xl:max-w-[330px]">
            <div className="flex h-[190px] items-center justify-center overflow-hidden rounded-[7px] border border-[#dde2ea] bg-[#f8f9fb]">
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.productName}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="text-[11px] text-[#9aa5b8]">No Image</div>
                )}
            </div>
            {imageCount > 0 && (
                <div className="mt-1 flex justify-center gap-1">
                    {images.map((image, index) => (
                        <button
                            key={image.key || image.url || index}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className={`h-[6px] rounded-full transition-all ${index === activeImageIndex
                                ? "w-[14px] bg-[#ff8a72]"
                                : "w-[6px] bg-[#cfd5df] hover:bg-[#aeb7c5]"
                                }`}
                            aria-label={`Show image ${index + 1} of ${imageCount}`}
                        />
                    ))}
                </div>
            )}

            <h2 className="mt-3 truncate text-[14px] font-bold text-black">
                {product.productName}
            </h2>

            <ProductInfo label="Product type" value={type} />
            <ProductInfo label="Quantity Stock" value={product.quantityStock} />
            <ProductInfo label="MRP" value={`₹ ${product.mrp}`} />
            <ProductInfo label="Selling Price" value={`₹ ${product.sellingPrice}`} />
            <ProductInfo label="Brand Name" value={product.brandName} />
            <ProductInfo label="Total Number of images" value={imageCount} />
            <ProductInfo label="Exchange Eligibility" value={(product.exchangeEligibility || "YES").toUpperCase()} />

            <div className="mt-4 grid grid-cols-[1fr_1fr_36px] gap-2">
                <button
                    type="button"
                    onClick={onToggleStatus}
                    className={`h-9 rounded-[6px] text-[13px] font-bold text-white ${status === "Published" ? "bg-[#22cc0e]" : "bg-[#1424ea]"}`}
                >
                    {publishAction}
                </button>
                <button
                    type="button"
                    onClick={onEdit}
                    className="h-9 rounded-[6px] border border-[#c9d0dc] text-[13px] font-bold text-[#31405a] hover:bg-slate-50"
                >
                    Edit
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="flex h-9 items-center justify-center rounded-[6px] border border-[#d9dfe8] text-[#9aa5b8] hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${product.productName}`}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </article>
    );
}

function ProductInfo({ label, value }) {
    return (
        <div className="mt-[7px] grid grid-cols-[1fr_auto] gap-2 text-[13px]">
            <span className="truncate text-[#9aa5b8]">{label} -</span>
            <span className="max-w-[135px] truncate text-right text-[#31405a]">{value || "-"}</span>
        </div>
    );
}

function ProductModal({
    mode,
    form,
    typeOpen,
    saving,
    message,
    onFieldChange,
    onTypeToggle,
    onTypeSelect,
    onFiles,
    onRemovePreview,
    onRemoveExisting,
    onClose,
    onSubmit,
}) {
    const allImages = [
        ...form.existingImages.map((image) => ({
            id: image.key || image.url,
            url: image.url,
            existing: true,
        })),
        ...form.imagePreviews,
    ];

    return (
        <ModalShell>
            <form
                onSubmit={onSubmit}
                className="w-full max-w-[430px] rounded-[7px] bg-white shadow-xl"
            >
                <div className="flex h-[54px] items-center justify-between border-b border-[#e5e8ee] px-6">
                    <h2 className="text-[16px] font-bold text-[#344158]">
                        {mode === "edit" ? "Edit Product" : "Add Product"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#344158] hover:text-black"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <Field label="Product Name">
                        <input
                            required
                            name="productName"
                            value={form.productName}
                            onChange={onFieldChange}
                            className={fieldClass}
                            placeholder="CakeZone Walnut Brownie"
                        />
                    </Field>

                    <Field label="Product Type">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={onTypeToggle}
                                className={`${fieldClass} flex items-center justify-between text-left ${!form.productType ? "text-[#a8b0c1]" : ""}`}
                            >
                                <span>{form.productType || "Select product type"}</span>
                                <ChevronDown size={14} />
                            </button>
                            {typeOpen && (
                                <div className="absolute left-0 right-0 top-[44px] z-10 rounded-[5px] bg-white p-2 shadow-[0_8px_20px_rgba(30,39,64,0.16)]">
                                    {productTypes.map((type, index) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => onTypeSelect(type)}
                                            className={`block h-9 w-full rounded-[3px] px-3 text-left text-[13px] text-[#31405a] hover:bg-[#f1f2f5] ${index === 0 ? "bg-[#efefef]" : ""}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Field>

                    <Field label="Quantity Stock">
                        <input
                            required
                            min="0"
                            name="quantityStock"
                            type="number"
                            value={form.quantityStock}
                            onChange={onFieldChange}
                            className={fieldClass}
                            placeholder="Total numbers of Stock available"
                        />
                    </Field>

                    <Field label="MRP">
                        <input
                            required
                            min="0"
                            name="mrp"
                            type="number"
                            value={form.mrp}
                            onChange={onFieldChange}
                            className={fieldClass}
                            placeholder="Total numbers of Stock available"
                        />
                    </Field>

                    <Field label="Selling Price">
                        <input
                            required
                            min="0"
                            name="sellingPrice"
                            type="number"
                            value={form.sellingPrice}
                            onChange={onFieldChange}
                            className={fieldClass}
                            placeholder="Total numbers of Stock available"
                        />
                    </Field>

                    <Field label="Brand Name">
                        <input
                            required
                            name="brandName"
                            value={form.brandName}
                            onChange={onFieldChange}
                            className={fieldClass}
                            placeholder="Total numbers of Stock available"
                        />
                    </Field>

                    <div>
                        <div className="mb-[6px] flex items-center justify-between">
                            <span className="text-[13px] font-bold text-[#344158]">
                                Upload Product Images
                            </span>
                            {allImages.length > 0 && (
                                <label className="cursor-pointer text-[13px] font-bold text-[#344158]">
                                    Add More Photos
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={onFiles}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="min-h-[72px] rounded-[6px] border border-dashed border-[#d9dee7] px-3 py-3">
                            {allImages.length === 0 ? (
                                <label className="flex h-[48px] cursor-pointer flex-col items-center justify-center text-center text-[13px]">
                                    <span className="text-[#a8b0c1]">Enter Description</span>
                                    <span className="font-bold text-[#344158]">Browse</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={onFiles}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {allImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className="relative h-12 w-12 rounded-[4px] border border-[#d9dee7] bg-white p-[2px]"
                                        >
                                            <img
                                                src={image.url}
                                                alt="Product preview"
                                                className="h-full w-full rounded-[2px] object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    image.existing
                                                        ? onRemoveExisting(image.id)
                                                        : onRemovePreview(image.id)
                                                }
                                                className="absolute -right-[6px] -top-[6px] flex h-[14px] w-[14px] items-center justify-center rounded-full border border-[#cbd2dd] bg-white text-[#344158]"
                                                aria-label="Remove image"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Field label="Exchange or return eligibility">
                        <select
                            name="exchangeEligibility"
                            value={form.exchangeEligibility}
                            onChange={onFieldChange}
                            className={fieldClass}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </Field>

                    {message && <p className="text-[13px] font-semibold text-red-600">{message}</p>}
                </div>

                <div className="flex h-[66px] items-center justify-end border-t border-[#e5e8ee] px-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex h-10 min-w-[78px] items-center justify-center gap-2 rounded-[6px] bg-[#1424ea] px-5 text-[13px] font-bold text-white disabled:opacity-70"
                    >
                        {saving && <Loader2 size={13} className="animate-spin" />}
                        {mode === "edit" ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function DeleteModal({ product, onClose, onDelete }) {
    return (
        <ModalShell>
            <div className="w-full max-w-[360px] rounded-[7px] bg-white px-6 py-5 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-[20px] font-bold text-[#343b4a]">Delete Product</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#343b4a] hover:text-black"
                        aria-label="Close delete modal"
                    >
                        <X size={17} />
                    </button>
                </div>
                <p className="mt-3 text-[14px] leading-[20px] text-[#343b4a]">
                    Are you sure you really want to delete this Product
                    <br />
                    <span className="font-bold">” {product?.productName} ” ?</span>
                </p>
                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="h-10 rounded-[6px] bg-[#1424ea] px-5 text-[13px] font-bold text-white"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

function ModalShell({ children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#17243a]/45 px-4 py-8 sm:py-[66px]">
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-[#344158]">{label}</span>
            {children}
        </label>
    );
}

function Toast({ type = "success", message, onClose }) {
    const isError = type === "error";

    return (
        <div className="fixed bottom-[30px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-[5px] border border-[#dfe4ec] bg-white px-3 py-2 shadow-[0_4px_16px_rgba(30,39,64,0.16)]">
            <span className={`flex h-[23px] w-[23px] items-center justify-center rounded-[5px] text-white ${isError ? "bg-[#dc2626]" : "bg-[#19aa71]"}`}>
                {isError ? <X size={16} strokeWidth={3} /> : <Check size={17} strokeWidth={3} />}
            </span>
            <span className="whitespace-nowrap text-[12px] font-bold text-[#344158]">{message}</span>
            <button
                type="button"
                onClick={onClose}
                className="text-[#344158]"
                aria-label="Close notification"
            >
                <X size={15} />
            </button>
        </div>
    );
}
