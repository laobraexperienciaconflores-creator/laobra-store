"use client";

import { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { getCustomerName, useCustomer } from "../lib/useCustomer";

/**
 * Cuando el cliente inicia sesión, completa los datos del comprador en el
 * checkout con los de su perfil (solo si esos campos están vacíos).
 */
export default function AccountSync() {
  const { user } = useCustomer();
  const { orderDetails, updateOrderDetails } = useCart();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    const name = getCustomerName(user);
    const metaPhone = user.user_metadata?.phone;
    const phone = typeof metaPhone === "string" ? metaPhone : user.phone ?? "";

    const fields: { buyerName?: string; buyerPhone?: string } = {};
    if (!orderDetails.buyerName.trim() && name) fields.buyerName = name;
    if (!orderDetails.buyerPhone.trim() && phone) fields.buyerPhone = phone;
    if (Object.keys(fields).length > 0) updateOrderDetails(fields);
  }, [user, orderDetails.buyerName, orderDetails.buyerPhone, updateOrderDetails]);

  return null;
}
