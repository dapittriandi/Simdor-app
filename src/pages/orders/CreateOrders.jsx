import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const CreateOrder = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const userEmail = userData?.email || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    pelanggan: "",
    statusOrder: "Draft",
    tanggalStatusOrder: "",
    tanggalSerahOrderKeCs: "",
    jenisPekerjaan: "",
    lokasiPekerjaan: "",
    noSiSpk: "",
    namaTongkang: "",
    estimasiTonase: "",
    tonaseDS: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.pelanggan || !formData.tanggalStatusOrder || !formData.tanggalSerahOrderKeCs || !formData.jenisPekerjaan || !formData.lokasiPekerjaan) {
      return "Harap isi semua field yang wajib diisi!";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const newOrder = {
        portofolio,
        pelanggan: formData.pelanggan,
        statusOrder: formData.statusOrder,
        tanggalStatusOrder: Timestamp.fromDate(new Date(formData.tanggalStatusOrder)),
        tanggalSerahOrderKeCs: Timestamp.fromDate(new Date(formData.tanggalSerahOrderKeCs)),
        jenisPekerjaan: formData.jenisPekerjaan,
        lokasiPekerjaan: formData.lokasiPekerjaan,
        noSiSpk: formData.noSiSpk || "",
        namaTongkang: formData.namaTongkang || "",
        estimasiTonase: formData.estimasiTonase || "",
        tonaseDS: formData.tonaseDS ? Number(formData.tonaseDS) : 0,

        // Field default yang akan dilengkapi nanti
        nomorOrder: "",
        tanggalOrder: null,
        tanggalPekerjaan: null,
        proformaSerahKeOps: null,
        proformaSerahKeDukbis: null,
        noSertifikatPM06: "",
        keteranganSertifikatPM06: "",
        noSertifikat: "",
        jenisSertifikat: "",
        nilaiProforma: 0,
        dokumenSelesaiINV: 0,
        nomorInvoice: "",
        fakturPajak: "",
        tanggalPengirimanInvoice: null,
        tanggalPengirimanFaktur: null,
        distribusiSertifikatPengirim: "",
        distribusiSertifikatPengirimTanggal: null,
        distribusiSertifikatPenerima: "",
        distribusiSertifikatPenerimaTanggal: null,

        // Metadata
        createdBy: userEmail,
        lastUpdatedBy: userEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "orders"), newOrder);
      navigate(`/orders/${portofolio}`);
    } catch (error) {
      setError("Gagal menambahkan order. Coba lagi.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Tambah Data Order {portofolio}</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-md rounded-md">
        {/* Wajib Diisi */}
        <div>
          <label className="block font-medium text-red-600">Nama Pelanggan *</label>
          <input type="text" name="pelanggan" value={formData.pelanggan} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium text-red-600">Status Order *</label>
          <select name="statusOrder" value={formData.statusOrder} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="Draft">Draft</option>
            <option value="Diproses">Diproses</option>
            <option value="Closed">Closed</option>
            <option value="Hold">Hold</option>
            <option value="Next Order">Next Order</option>
            <option value="Archecking">Archecking</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-red-600">Tanggal Status Order *</label>
          <input type="date" name="tanggalStatusOrder" value={formData.tanggalStatusOrder} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium text-red-600">Tanggal Serah Order ke CS *</label>
          <input type="date" name="tanggalSerahOrderKeCs" value={formData.tanggalSerahOrderKeCs} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium text-red-600">Jenis Pekerjaan *</label>
          <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium text-red-600">Lokasi Pekerjaan *</label>
          <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        {/* Opsional */}
        <div>
          <label className="block font-medium text-gray-600">No SI/SPK</label>
          <input type="text" name="noSiSpk" value={formData.noSiSpk} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium text-gray-600">Nama Tongkang</label>
          <input type="text" name="namaTongkang" value={formData.namaTongkang} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium text-gray-600">Estimasi Tonase</label>
          <input type="text" name="estimasiTonase" value={formData.estimasiTonase} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium text-gray-600">Tonase DS</label>
          <input type="number" name="tonaseDS" value={formData.tonaseDS} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-600" disabled={loading}>
          {loading ? "Menambahkan..." : "Tambah"}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
