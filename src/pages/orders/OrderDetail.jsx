import { useParams, useNavigate } from "react-router-dom";

const OrderDetail = () => {
  const { id } = useParams(); // Ambil ID order dari URL
  const navigate = useNavigate();

  // Data dummy
  const order = {
    id,
    nama: "PT Pasar Tani",
    status: "Diproses",
    tonase: "3200 MT",
    nilai: "Rp. 7.572.664",
    lokasi: "JETTY TBT",
    tanggal: "05-07-2024",
  };

  return (
    <div className="ml-30 p-6">
      <h2 className="text-2xl font-semibold">Detail Order #{id}</h2>
      <div className="mt-4 border p-4">
        <p><strong>Nama Pelanggan:</strong> {order.nama}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Tonase:</strong> {order.tonase}</p>
        <p><strong>Nilai:</strong> {order.nilai}</p>
        <p><strong>Lokasi Pekerjaan:</strong> {order.lokasi}</p>
        <p><strong>Tanggal:</strong> {order.tanggal}</p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Kembali
      </button>
    </div>
  );
};

export default OrderDetail;
