import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const navigate = useNavigate();

  // Data dummy (bisa diganti dengan API)
  const orders = [
    { id: 1, nama: "PT Pasar Tani", status: "Diproses", tonase: "3200 MT", nilai: "Rp. 7.572.664" },
    { id: 2, nama: "PT Batu Muda", status: "Selesai", tonase: "1500 MT", nilai: "Rp. 3.240.000" },
  ];

  return (
    <div className="ml-30 p-6">
      <h2 className="text-2xl font-semibold">Daftar Order Batu Bara</h2>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Nama Pelanggan</th>
              <th className="p-2 border">Status Order</th>
              <th className="p-2 border">Tonase</th>
              <th className="p-2 border">Nilai Order</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border">
                <td className="p-2 border">{order.nama}</td>
                <td className="p-2 border">{order.status}</td>
                <td className="p-2 border">{order.tonase}</td>
                <td className="p-2 border">{order.nilai}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => navigate(`/order-detail/${order.id}`)}
                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
