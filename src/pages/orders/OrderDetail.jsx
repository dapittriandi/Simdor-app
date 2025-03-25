import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";

const OrderDetail = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data user dari localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const userBidang = userData?.bidang || "";

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
  
      try {
        console.log("Fetching order with ID:", id);
        const data = await getOrderById(id);
        console.log("Order Data:", data);
  
        if (data) {
          setOrder(data);
        } else {
          setError("❌ Order tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("⚠️ Terjadi kesalahan saat mengambil data.");
      }
      setLoading(false);
    };
  
    fetchOrder();
  }, [id]);
  

  // Fungsi untuk menampilkan tanggal dengan format yang rapi
  const formatDate = (value) => {
    if (!value) return "-";
    if (value instanceof Timestamp) {
      const date = value.toDate();
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    }
    return value; // Jika sudah dalam format string, langsung tampilkan
  };

  // Fungsi cek apakah user sudah bisa mengedit data sesuai hak aksesnya
  const isEditableByRole = (order, role) => {
    const requiredFields = {
      "admin portofolio": [
        "pelanggan",
        "statusOrder",
        "tanggalSerahOrderKeCs",
        "tanggalPekerjaan",
        "proformaSerahKeOps",
        "proformaSerahKeDukbis",
        "sertifikatPM06",
        "noSertifikat",
        "noSiSpk",
        "jenisPekerjaan",
        "namaTongkang",
        "lokasiPekerjaan",
        "estimasiTonase",
        "tonaseDS",
        "nilaiProforma",
      ],
      "koordinator": [],
      "customer service": ["nomorOrder", "tanggalOrder"],
      "admin keuangan": [
        "tanggalPengirimanInvoice",
        "tanggalPengirimanFaktur",
        "nomorInvoice",
        "fakturPajak",
        "dokumenSelesaiINV",
      ],
      all: [
        "distribusiSertifikatPengirim",
        "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima",
        "distribusiSertifikatPenerimaTanggal",
      ],
    };

    const userRequiredFields = [...requiredFields[role], ...requiredFields.all];
    return userRequiredFields.every((field) => order[field] !== "" && order[field] !== null);
  };

  if (loading) return <p className="text-center text-gray-600">⏳ Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const canEdit = isEditableByRole(order, userPeran);

  // Fungsi hapus order (Hanya Admin Portofolio)
  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus order ini?")) return;
    try {
      await deleteOrder(id);
      alert("✅ Order berhasil dihapus!");
      navigate(`/orders/${portofolio}`);
    } catch (err) {
      console.error("Gagal menghapus order:", err);
      alert("❌ Gagal menghapus order.");
    }
  };

  // Mapping untuk title yang lebih rapi
  const fieldTitles = [
    { key: "pelanggan", label: "Nama Pelanggan" },
    { key: "statusOrder", label: "Status Order" },
    { key: "nomorOrder", label: "Nomor Order" },
    { key: "tanggalOrder", label: "Tanggal Order", isDate: true },
    { key: "tanggalPekerjaan", label: "Tanggal Pekerjaan", isDate: true },
    { key: "lokasiPekerjaan", label: "Lokasi Pekerjaan" },
    { key: "noSiSpk", label: "No SI/SPK" },
    { key: "keteranganSertifikatPM06", label: "Keterangan Sertifikat PM06" },
    { key: "noSertifikat", label: "Nomor Sertifikat" },
    { key: "jenisSertifikat", label: "Jenis Sertifikat" },
    { key: "namaTongkang", label: "Nama Tongkang" },
    { key: "estimasiTonase", label: "Estimasi Tonase" },
    { key: "tonaseDS", label: "Tonase DS" },
    { key: "nilaiProforma", label: "Nilai Proforma" },
    { key: "dokumenSelesaiINV", label: "Dokumen Selesai INV" },
    { key: "nomorInvoice", label: "Nomor Invoice" },
    { key: "fakturPajak", label: "Faktur Pajak" },
    { key: "tanggalPengirimanInvoice", label: "Tanggal Pengiriman Invoice", isDate: true },
    { key: "tanggalPengirimanFaktur", label: "Tanggal Pengiriman Faktur", isDate: true },
    { key: "distribusiSertifikatPengirim", label: "Distribusi Sertifikat Pengirim" },
    { key: "distribusiSertifikatPengirimTanggal", label: "Tanggal Distribusi Pengirim", isDate: true },
    { key: "distribusiSertifikatPenerima", label: "Distribusi Sertifikat Penerima" },
    { key: "distribusiSertifikatPenerimaTanggal", label: "Tanggal Distribusi Penerima", isDate: true },
    { key: "createdBy", label: "Dibuat Oleh" },
    { key: "lastUpdatedBy", label: "Terakhir Diperbarui Oleh" },
    { key: "createdAt", label: "Dibuat Pada", isDate: true },
    { key: "updatedAt", label: "Diperbarui Pada", isDate: true },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6">Detail Order</h2>
      <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded">
        {fieldTitles.map((field) => (
          <div key={field.key}>
            <p className="font-semibold">{field.label}:</p>
            <p>{field.isDate ? formatDate(order[field.key]) : order[field.key] || "-"}</p>
          </div>
        ))}
      </div>

      {/* Tombol Aksi */}
      {userPeran !== "koordinator" && (
    <>
      <div className="mt-6 flex justify-between">
        {canEdit ? (
          <button onClick={() => navigate(`/orders/${portofolio}/detail/edit/${id}`)}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600">
            Edit
          </button>
        ) : (
          <button onClick={() => navigate(`/orders/${portofolio}/detail/lengkapi/${id}`)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Lengkapi Data
          </button>
        )}
        {userPeran === "admin portofolio" && userBidang === portofolio && (
          <button onClick={handleDelete}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
            Hapus Order
          </button>
          
        )}
      </div>
      </>
  )}
    </div>
  );
};

export default OrderDetail;
