import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MainLayout, ProductForm, Notification, Button } from "../../../components";
import { productService } from "../../../services";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Product Management", href: "/product-management" },
    { label: `Edit Produk ${id ? `(#${id})` : ""}`, active: true },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingData(true);
        setErrorMsg("");
        const response = await productService.getProductById(id);
        if (response.data) {
          setInitialData({
            name: response.data.name || "",
            price: response.data.price || 0,
            stock: response.data.stock !== undefined ? response.data.stock : 0,
            categoryId: response.data.categoryId || "",
            description: response.data.description || "",
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        if (error.status === 404) {
          setNotFound(true);
        } else {
          setErrorMsg(error.message || "Gagal memuat data produk dari server.");
        }
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleUpdateProduct = async (formData) => {
    try {
      setSaving(true);
      setErrorMsg("");
      await productService.updateProduct(id, formData);
      navigate("/product-management");
    } catch (error) {
      console.error("Gagal mengupdate produk:", error);
      setErrorMsg(
        error.message || "Gagal memperbarui data produk. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="columns is-centered">
        <div className="column is-8-tablet is-7-desktop">
          {loadingData ? (
            <div className="card-container has-text-centered py-6">
              <div className="loader is-inline-block mr-2" />
              <p className="title is-6 has-text-grey">
                Memuat data produk #{id}...
              </p>
            </div>
          ) : notFound ? (
            <div className="card-container has-text-centered py-6">
              <Notification type="warning" className="mb-4">
                <p className="title is-5 mb-2">Produk Tidak Ditemukan</p>
                <p className="subtitle is-6 has-text-grey mb-0">
                  Data produk dengan ID #{id} tidak ada di database sistem.
                </p>
              </Notification>
              <Button to="/product-management" variant="primary" size="small">
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <ArrowLeft size={15} />
                  <span>Kembali ke Katalog Produk</span>
                </span>
              </Button>
            </div>
          ) : (
            <ProductForm
              title={`Edit Produk: ${initialData?.name || `#${id}`}`}
              headerVariant="info"
              submitText="Simpan Perubahan"
              initialData={initialData}
              onSubmit={handleUpdateProduct}
              cancelTo="/product-management"
              loading={saving}
              errorMsg={errorMsg}
              onCloseError={() => setErrorMsg("")}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProductPage;
