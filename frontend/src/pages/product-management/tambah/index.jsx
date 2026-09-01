import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, ProductForm } from "../../../components";
import { productService } from "../../../services";

const TambahProductPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Product Management", href: "/product-management" },
    { label: "Tambah Produk", active: true },
  ];

  const handleSaveProduct = async (formData) => {
    try {
      setLoading(true);
      setErrorMsg("");
      await productService.createProduct(formData);
      navigate("/product-management");
    } catch (error) {
      console.error("Gagal menambahkan produk:", error);
      setErrorMsg(
        error.message ||
        "Gagal menyimpan data produk. Periksa kembali data atau koneksi backend Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="columns is-centered">
        <div className="column is-8-tablet is-7-desktop">
          <ProductForm
            title="Tambah Produk Baru"
            headerVariant="primary"
            submitText="Simpan Produk"
            onSubmit={handleSaveProduct}
            cancelTo="/product-management"
            loading={loading}
            errorMsg={errorMsg}
            onCloseError={() => setErrorMsg("")}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default TambahProductPage;
