import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

export const getOrders = async () => {
  const querySnapshot = await getDocs(collection(db, "orders"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getOrderById = async (id) => {
  const orderRef = doc(db, "orders", id);
  const orderSnap = await getDoc(orderRef);
  return orderSnap.exists() ? { id: orderSnap.id, ...orderSnap.data() } : null;
};

export const updateOrder = async (id, updatedData) => {
  const orderRef = doc(db, "orders", id);
  await updateDoc(orderRef, updatedData);
};

export const deleteOrder = async (id) => {
  const orderRef = doc(db, "orders", id);
  await deleteDoc(orderRef);
};
