import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { productService } from "../services";

// membuat context react untuk membagikan state keranjang belanja ke seluruh komponen
const CartContext = createContext();

// provider component: mengelola state dan logika bisnis keranjang belanja
export const CartProvider = ({ children }) => {
  // inisialisasi state keranjang dengan membaca data yang tersimpan di localstorage browser
  const [items, setItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("luxury_shop_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error("Gagal membaca cart dari localStorage:", e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [serverCart, setServerCart] = useState({
    subtotal: 0,
    totalItems: 0,
    shippingFee: 0,
    grandTotal: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // sinkronisasi & kalkulasi total keranjang ke backend secara server-side
  const syncServerCart = useCallback(async (currentItems) => {
    if (!currentItems || currentItems.length === 0) {
      setServerCart({
        subtotal: 0,
        totalItems: 0,
        shippingFee: 0,
        grandTotal: 0,
      });
      return;
    }

    try {
      setIsCalculating(true);
      const res = await productService.calculateCart(currentItems);
      const data = res.data || res;
      if (data) {
        setServerCart({
          subtotal: data.subtotal || 0,
          totalItems: data.totalItems || 0,
          shippingFee: data.shippingFee || 0,
          grandTotal: data.grandTotal || 0,
        });

        // sinkronkan harga dan stok terbaru dari database server hanya jika ada perubahan riil
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems((prev) => {
            let hasChanged = false;
            const updated = prev.map((it) => {
              const serverItem = data.items.find((si) => si.id === it.id);
              if (serverItem) {
                if (
                  it.price !== serverItem.price ||
                  it.stock !== serverItem.stock ||
                  it.name !== serverItem.name
                ) {
                  hasChanged = true;
                  return {
                    ...it,
                    price: serverItem.price,
                    stock: serverItem.stock,
                    name: serverItem.name,
                  };
                }
              }
              return it;
            });
            return hasChanged ? updated : prev;
          });
        }
      }
    } catch (e) {
      console.error("Gagal kalkulasi keranjang sisi server:", e);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // simpan state keranjang ke localstorage setiap kali ada perubahan item
  useEffect(() => {
    try {
      localStorage.setItem("luxury_shop_cart", JSON.stringify(items));
      syncServerCart(items);
    } catch (e) {
      console.error("Gagal menyimpan cart ke localStorage:", e);
    }
  }, [items, syncServerCart]);

  // menambahkan produk ke keranjang belanja (jika produk sudah ada, tambahkan kuantitasnya)
  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) return false;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          stock: product.stock,
          price: Number(product.price),
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            stock: product.stock,
            imageUrl: product.imageUrl,
            category: product.category?.name || "Umum",
            quantity: Math.min(quantity, product.stock),
          },
        ];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  // mengubah kuantitas item produk di keranjang
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const validQty = Math.min(newQuantity, item.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  // menghapus satu item produk dari keranjang
  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // mengosongkan seluruh isi keranjang
  const clearCart = () => {
    setItems([]);
  };

  // menghitung total kuantitas item dan total harga belanjaan
  const totalItems =
    serverCart.totalItems ||
    items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice =
    serverCart.grandTotal ||
    items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // fungsi toggle modal drawer keranjang & modal checkout
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        subtotal: serverCart.subtotal || totalPrice,
        shippingFee: serverCart.shippingFee || 0,
        isCalculating,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckout,
        closeCheckout,
        syncServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// custom hook helper agar komponen lain dapat menggunakan state keranjang dengan mudah
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }
  return context;
};

export default CartContext;
