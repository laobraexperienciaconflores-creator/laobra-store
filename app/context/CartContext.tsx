"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  calculateDeliveryCost,
  FREE_DELIVERY_THRESHOLD,
  DEFAULT_DISTRICT,
} from "../lib/delivery";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  referenceImage?: string;
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
  deliveryDistrict: string;
  deliveryAddress: string;
  deliveryReference: string;
  deliveryLocationUrl?: string;
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
  deliveryDistrict: DEFAULT_DISTRICT,
  deliveryAddress: "",
  deliveryReference: "",
  deliveryLocationUrl: "",
  deliveryDate: "",
  deliveryTime: "10:00 AM",
  dedication: "",
  dedicationFrom: "",
};

export const AVAILABLE_COUPONS: Record<string, Coupon> = {
  LAOBRA01: {
    code: "LAOBRA01",
    discountPercentage: 15,
    description: "15% de descuento en tu primer ramo",
  },
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
  addItem: (product: { id: string; name: string; price: number; imageUrl: string; referenceImage?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  totalPrice: number;
  discountAmount: number;
  deliveryCost: number;
  deliveryBaseRate: number;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isFirstDiscountUsed: boolean;
  markFirstDiscountAsUsed: () => void;
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
  const [isFirstDiscountUsed, setIsFirstDiscountUsed] = useState(false);
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

      const discountAlreadyUsed =
        localStorage.getItem("laobra_first_discount_used") === "true";
      setIsFirstDiscountUsed(discountAlreadyUsed);

      const isCouponExplicitlyRemoved =
        localStorage.getItem("laobra_coupon_removed") === "true";

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);

      if (discountAlreadyUsed) {
        // Si ya usó el cupón de bienvenida en una compra anterior, no aplicar
        setAppliedCoupon(null);
        localStorage.removeItem(COUPON_STORAGE_KEY);
      } else if (!isCouponExplicitlyRemoved) {
        if (savedCoupon) {
          const parsedCoupon = JSON.parse(savedCoupon);
          if (parsedCoupon?.code && AVAILABLE_COUPONS[parsedCoupon.code.toUpperCase()]) {
            setAppliedCoupon(AVAILABLE_COUPONS[parsedCoupon.code.toUpperCase()]);
          } else {
            setAppliedCoupon(AVAILABLE_COUPONS["LAOBRA01"]);
          }
        } else {
          // Promoción de bienvenida por defecto (15% primer ramo)
          setAppliedCoupon(AVAILABLE_COUPONS["LAOBRA01"]);
        }
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

  const addItem = (product: { id: string; name: string; price: number; imageUrl: string; referenceImage?: string }) => {
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

    const isUsed =
      isFirstDiscountUsed ||
      (typeof window !== "undefined" &&
        localStorage.getItem("laobra_first_discount_used") === "true");

    if (isUsed && (cleanCode === "LAOBRA01" || cleanCode === "PRIMERRAMO15")) {
      return {
        success: false,
        message:
          "El cupón del 15% de bienvenida es exclusivo para tu primera compra y ya fue utilizado.",
      };
    }

    const coupon = AVAILABLE_COUPONS[cleanCode];

    if (coupon) {
      setAppliedCoupon(coupon);
      try {
        localStorage.removeItem("laobra_coupon_removed");
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

  const markFirstDiscountAsUsed = () => {
    setIsFirstDiscountUsed(true);
    setAppliedCoupon(null);
    try {
      localStorage.setItem("laobra_first_discount_used", "true");
      localStorage.removeItem(COUPON_STORAGE_KEY);
      localStorage.setItem("laobra_coupon_removed", "true");
    } catch {
      // Ignore
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
      localStorage.setItem("laobra_coupon_removed", "true");
    } catch {
      // Ignore
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? Math.round(((subtotal * appliedCoupon.discountPercentage) / 100) * 100) / 100
    : 0;

  const {
    deliveryCost,
    isFreeDelivery,
    baseRate: deliveryBaseRate,
  } = calculateDeliveryCost(subtotal, orderDetails.deliveryDistrict);

  // El costo de envío se agrega al total a pagar cuando hay productos en el carrito
  const totalPrice =
    items.length > 0
      ? Math.max(0, subtotal - discountAmount) + deliveryCost
      : 0;

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
        deliveryCost,
        deliveryBaseRate,
        isFreeDelivery,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isFirstDiscountUsed,
        markFirstDiscountAsUsed,
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
