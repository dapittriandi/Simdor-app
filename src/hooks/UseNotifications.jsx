// src/hooks/useNotifications.js
import { useEffect, useState, useRef } from "react";
import { db } from "../services/firebase"; // sesuaikan path
import {
  collection, query, where, orderBy,
  limit, onSnapshot,
} from "firebase/firestore";

/**
 * Menghasilkan notifikasi real-time dari collection /orders
 * berdasarkan peran user yang sedang aktif.
 *
 * @param {object} userData  — activeUser dari UserContext { peran, bidang, id, ... }
 * @returns {{ notifications, unreadCount, markAllRead, markOneRead }}
 */
const useNotifications = (userData) => {
  const [notifications, setNotifications] = useState([]);
  // Set untuk melacak notif yang sudah di-dismiss/dibaca di session ini
  const readSet = useRef(new Set());

  const peran   = userData?.peran  || "";
  const bidang  = userData?.bidang || "";
  const userId  = userData?.id     || userData?.uid || "";

  useEffect(() => {
    if (!peran) return;

    // ── Bangun query berdasarkan peran ──
    let q;

    if (peran === "admin portofolio" && bidang) {
      // Admin portofolio hanya lihat order portofolionya
      q = query(
        collection(db, "orders"),
        where("portofolio", "==", bidang),
        orderBy("updatedAt", "desc"),
        limit(50)
      );
    } else if (peran === "customer service") {
      // CS lihat order yang belum punya nomorOrder
      q = query(
        collection(db, "orders"),
        orderBy("updatedAt", "desc"),
        limit(50)
      );
    } else if (peran === "admin keuangan") {
      // Keuangan lihat order status Invoice / Penerbitan Proforma
      q = query(
        collection(db, "orders"),
        where("statusOrder", "in", ["Invoice", "Penerbitan Proforma"]),
        orderBy("updatedAt", "desc"),
        limit(50)
      );
    } else if (peran === "koordinator") {
      // Koordinator lihat semua order terbaru
      q = query(
        collection(db, "orders"),
        orderBy("updatedAt", "desc"),
        limit(50)
      );
    } else {
      return;
    }

    // ── Real-time listener ──
    const unsub = onSnapshot(q, (snap) => {
      const newNotifs = [];

      snap.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        const notifId = (type) => `${doc.id}_${type}`;

        const updatedAt = order.updatedAt?.seconds
          ? new Date(order.updatedAt.seconds * 1000)
          : null;
        const timeStr = updatedAt ? formatRelative(updatedAt) : "Baru saja";

        // ── RULES PER PERAN ──

        if (peran === "admin portofolio") {
          // 1. Order baru yang belum diproses
          if (order.statusOrder === "New Order") {
            newNotifs.push({
              id: notifId("new_order"),
              orderId: doc.id,
              type: "warning",
              title: "Order Baru Menunggu",
              body: `Order dari ${order.pelanggan || "—"} menunggu diproses.`,
              time: timeStr,
              read: readSet.current.has(notifId("new_order")),
            });
          }
          // 2. Data tidak lengkap (nilaiProforma atau tonaseDS kosong)
          if (
            order.statusOrder !== "Selesai" &&
            order.statusOrder !== "New Order" &&
            (!order.nilaiProforma || !order.tonaseDS)
          ) {
            newNotifs.push({
              id: notifId("incomplete"),
              orderId: doc.id,
              type: "warning",
              title: "Data Belum Lengkap",
              body: `Order ${order.nomorOrder || doc.id} (${order.pelanggan || "—"}) masih ada field yang kosong.`,
              time: timeStr,
              read: readSet.current.has(notifId("incomplete")),
            });
          }
          // 3. Order selesai
          if (order.statusOrder === "Selesai") {
            newNotifs.push({
              id: notifId("done"),
              orderId: doc.id,
              type: "success",
              title: "Order Selesai",
              body: `Order ${order.nomorOrder || doc.id} (${order.pelanggan || "—"}) telah selesai.`,
              time: timeStr,
              read: readSet.current.has(notifId("done")),
            });
          }
        }

        if (peran === "customer service") {
          // 1. Order yang belum diberi nomor order
          if (!order.nomorOrder && order.statusOrder !== "New Order") {
            newNotifs.push({
              id: notifId("no_nomor"),
              orderId: doc.id,
              type: "warning",
              title: "Nomor Order Belum Diisi",
              body: `Order dari ${order.pelanggan || "—"} belum memiliki nomor order.`,
              time: timeStr,
              read: readSet.current.has(notifId("no_nomor")),
            });
          }
          // 2. Order baru masuk
          if (order.statusOrder === "New Order") {
            newNotifs.push({
              id: notifId("new_cs"),
              orderId: doc.id,
              type: "info",
              title: "Order Baru Masuk",
              body: `Order dari ${order.pelanggan || "—"} menunggu penomoran.`,
              time: timeStr,
              read: readSet.current.has(notifId("new_cs")),
            });
          }
        }

        if (peran === "admin keuangan") {
          // 1. Order masuk status Invoice — perlu tindakan keuangan
          if (order.statusOrder === "Invoice" && !order.nomorInvoice) {
            newNotifs.push({
              id: notifId("invoice_action"),
              orderId: doc.id,
              type: "warning",
              title: "Invoice Perlu Dilengkapi",
              body: `Order ${order.nomorOrder || doc.id} (${order.pelanggan || "—"}) menunggu pengisian invoice.`,
              time: timeStr,
              read: readSet.current.has(notifId("invoice_action")),
            });
          }
          // 2. Penerbitan Proforma perlu dikonfirmasi
          if (order.statusOrder === "Penerbitan Proforma") {
            newNotifs.push({
              id: notifId("proforma"),
              orderId: doc.id,
              type: "info",
              title: "Proforma Perlu Konfirmasi",
              body: `Order ${order.nomorOrder || doc.id} (${order.pelanggan || "—"}) menunggu konfirmasi proforma.`,
              time: timeStr,
              read: readSet.current.has(notifId("proforma")),
            });
          }
        }

        if (peran === "koordinator") {
          // Koordinator: notif status berubah dalam 24 jam terakhir
          const isRecent = updatedAt && (Date.now() - updatedAt.getTime()) < 86400000;
          if (isRecent && order.statusOrder) {
            newNotifs.push({
              id: notifId("status_change"),
              orderId: doc.id,
              type: "info",
              title: "Status Order Diperbarui",
              body: `Order ${order.nomorOrder || doc.id} berubah ke "${order.statusOrder}".`,
              time: timeStr,
              read: readSet.current.has(notifId("status_change")),
            });
          }
        }
      });

      // Sort: unread dulu, lalu by time
      newNotifs.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return 0;
      });

      setNotifications(newNotifs.slice(0, 20)); // max 20 notif
    });

    return () => unsub();
  }, [peran, bidang, userId]);

  const markAllRead = () => {
    notifications.forEach((n) => readSet.current.add(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    readSet.current.add(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAllRead,
    markOneRead,
  };
};

/* ── Helper: format waktu relatif ── */
const formatRelative = (date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)  return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
};

export default useNotifications;