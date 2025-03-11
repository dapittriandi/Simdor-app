import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";

const EditOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data user dari localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getOrderById(id);
        if (data) {
          setFormData(getEditableFields(data, userPeran, portofolio));
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
  }, [id, userPeran, portofolio]);

  // Fungsi untuk mendapatkan field yang bisa diedit berdasarkan peran user
  const getEditableFields = (data, role, portofolio) => {
    const fields = {
      "admin portofolio": [
        "pelanggan", "statusOrder", "tanggalSerahOrderKeCs", "tanggalPekerjaan",
        "proformaSerahKeOps", "proformaSerahKeDukbis", "noSiSpk", "jenisPekerjaan",
        "namaTongkang", "lokasiPekerjaan", "estimasiTonase", "tonaseDS", "nilaiProforma",
        "noSertifikat", "jenisSertifikat",
        ...(portofolio === "batubara" || portofolio === "ksp" ? ["sertifikatPM06", "keteranganSertifikatPM06"] : [])
      ],
      "customer service": ["nomorOrder", "tanggalOrder"],
      "admin keuangan": ["tanggalPengirimanInvoice", "tanggalPengirimanFaktur", "nomorInvoice", "fakturPajak", "dokumenSelesaiINV"],
      all: [
        "distribusiSertifikatPengirim", "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima", "distribusiSertifikatPenerimaTanggal"
      ]
    };

    const editableFields = new Set([...fields[role], ...fields.all]);
    let newFormData = {};

    editableFields.forEach((field) => {
      if (data[field] instanceof Timestamp) {
        newFormData[field] = new Date(data[field].seconds * 1000).toISOString().split("T")[0]; // Format YYYY-MM-DD
      } else {
        newFormData[field] = data[field] || "";
      }
    });

    return newFormData;
  };

  // Fungsi menangani input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes("tonase") || name.includes("nilaiProforma") || name.includes("dokumenSelesaiINV")) {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Fungsi menangani input tanggal
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value ? Timestamp.fromDate(new Date(value)) : null });
  };

  // Fungsi simpan perubahan ke Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = { ...formData, updatedAt: Timestamp.now() };
      await updateOrder(id, updatedData);
      alert("✅ Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch (err) {
      console.error("Gagal menyimpan perubahan:", err);
      setError("❌ Gagal menyimpan perubahan.");
    }
    setLoading(false);
  };

  if (loading) return <p className="text-center text-gray-600">⏳ Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Edit Data Order</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block text-gray-600">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>

            {/* Dropdown untuk Status Order */}
            {key === "statusOrder" ? (
              <select name={key} value={formData[key]} onChange={handleChange} className="w-full p-2 border rounded-lg">
                <option value="Draft">Draft</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Closed">Closed</option>
                <option value="Next Order">Next Order</option>
                <option value="Archecking">Archecking</option>
              </select>
            ) : key === "jenisSertifikat" ? (
              <select name={key} value={formData[key]} onChange={handleChange} className="w-full p-2 border rounded-lg">
                <option value="LOADING">LOADING (BATUBARA, KSP)</option>
                <option value="LS (PIK)">LS (PIK)</option>
                <option value="SERTIFIKAT">SERTIFIKAT</option>
                <option value="LAPORAN">LAPORAN</option>
                <option value="KALIBRASI">KALIBRASI</option>
                <option value="HALAL">HALAL</option>
              </select>
              ) : key === "keteranganSertifikatPM06" ? (
                <select name={key} value={formData[key]} onChange={handleChange} className="w-full p-2 border rounded-lg">
                  <option value="Tidak Ada">Tidak Ada</option>
                  <option value="Ada">Ada</option>
                </select>
            ) : key.includes("tanggal") || 
                key.includes("proformaSerahKeOps") || key.includes("proformaSerahKeDukbis") ||
                key.includes("distribusiSertifikatPenerimaTanggal") || 
                key.includes("distribusiSertifikatPengirimTanggal") || 
                key.includes("tanggalOrder") || 
                key.includes("tanggalPengirimanInvoice") || 
                key.includes("tanggalPengirimanFaktur") ? (
              <input type="date" name={key} value={formData[key]} onChange={handleDateChange} className="w-full p-2 border rounded-lg" />
            ) : (
              <input type="text" name={key} value={formData[key]} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            )}
          </div>
        ))}
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default EditOrder;
