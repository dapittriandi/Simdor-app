import { useState, useEffect } from "react";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userFromStorage = localStorage.getItem("user");
      if (!userFromStorage) {
        throw new Error("User data tidak ditemukan.");
      }

      const parsedUser = JSON.parse(userFromStorage);
      
      // Cek apakah parsedUser valid dan memiliki properti yang dibutuhkan
      if (!parsedUser || typeof parsedUser !== "object") {
        throw new Error("User data tidak valid.");
      }

      // Pastikan properti tidak undefined sebelum digunakan
      const role = parsedUser?.peran || "Unknown Role";
      const bidang = parsedUser?.bidang || "Unknown Portofolio";

      setUserData({
        ...parsedUser,
        peran: role,
        bidang: bidang,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Profil Pengguna</h2>
      <div className="border p-4 rounded">
        <p><strong>Nama:</strong> {userData.nama || "-"}</p>
        <p><strong>Email:</strong> {userData.email || "-"}</p>
        <p><strong>Peran:</strong> {userData.peran}</p>
        <p><strong>Portofolio:</strong> {userData.bidang}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
