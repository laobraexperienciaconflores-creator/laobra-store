"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  description: string;
}

export interface OrderDetails {
  buyerName: string;
  buyerPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryReference: string;
  deliveryDate: string;
  deliveryTime: string;
  dedication: string;
  dedicationFrom: string;
}

const initialOrderDetails: OrderDetails = {
  buyerName: "",
  buyerPhone: "",
  recipientName: "",
  recipientPhone: "",
  deliveryAddress: "",
  deliveryReference: "",
  deliveryDate: "",
  deliveryTime: "10:00 AM",
  dedication: "",
  dedicationFrom: "",
};

export const AVAILABLE_COUPONS: Record<string, Coupon> = {
  PRIMERRAMO15: {
    code: "PRIMERRAMO15",
    discountPercentage: 15,
    description: "15% de descuento en tu primer ramo",
  },
};

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: { id: string; name: string; price: number; imageUrl: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  totalPrice: number;
  discountAmount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  orderDetails: OrderDetails;
  updateOrderDetails: (fields: Partial<OrderDetails>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "laobra_cart_v2";
const DETAILS_STORAGE_KEY = "laobra_order_details_v2";
const COUPON_STORAGE_KEY = "laobra_coupon_v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(initialOrderDetails);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage safely on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const savedDetails = localStorage.getItem(DETAILS_STORAGE_KEY);
      if (savedDetails) {
        const parsedDetails = JSON.parse(savedDetails);
        setOrderDetails((prev) => ({ ...prev, ...parsedDetails }));
      }

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsedCoupon = JSON.parse(savedCoupon);
        if (parsedCoupon?.code && AVAILABLE_COUPONS[parsedCoupon.code.toUpperCase()]) {
          setAppliedCoupon(AVAILABLE_COUPONS[parsedCoupon.code.toUpperCase()]);
        }
      } else if (localStorage.getItem("laobra_discount_claimed") === "true") {
        setAppliedCoupon(AVAILABLE_COUPONS["PRIMERRAMO15"]);
      }
    } catch {
      // Ignore storage errors
    }
    setIsHydrated(true);
  }, []);

  // Save items to localStorage whenever changed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, isHydrated]);

  // Save order details to localStorage whenever changed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(orderDetails));
    } catch {
      // Ignore storage errors
    }
  }, [orderDetails, isHydrated]);

  // Save applied coupon to localStorage whenever changed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [appliedCoupon, isHydrated]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (product: { id: string; name: string; price: number; imageUrl: string }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const updateOrderDetails = (fields: Partial<OrderDetails>) => {
    setOrderDetails((prev) => ({ ...prev, ...fields }));
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS[cleanCode];

    if (coupon) {
      setAppliedCoupon(coupon);
      try {
        localStorage.setItem("laobra_discount_claimed", "true");
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } catch {
        // Ignore
      }
      return {
        success: true,
        message: `¡Descuento del ${coupon.discountPercentage}% aplicado con éxito!`,
      };
    }

    return {
      success: false,
      message: "El código de cupón no es válido o ha expirado.",
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? Math.round(((subtotal * appliedCoupon.discountPercentage) / 100) * 100) / 100
    : 0;
  const totalPrice = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        totalPrice,
        discountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orderDetails,
        updateOrderDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  }
  return context;
}
