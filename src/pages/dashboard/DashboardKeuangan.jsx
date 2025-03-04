import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", blue: 500, red: 300, brown: 1000 },
  { month: "Feb", blue: 700, red: 500, brown: 800 },
  { month: "Mar", blue: 900, red: 700, brown: 900 },
  { month: "Apr", blue: 200, red: 500, brown: 600 },
  { month: "May", blue: 800, red: 600, brown: 950 },
  { month: "Jun", blue: 300, red: 700, brown: 850 },
  { month: "Jul", blue: 400, red: 500, brown: 900 },
  { month: "Aug", blue: 600, red: 800, brown: 1000 },
  { month: "Sep", blue: 700, red: 600, brown: 700 },
  { month: "Oct", blue: 500, red: 400, brown: 750 },
  { month: "Nov", blue: 650, red: 500, brown: 800 },
];

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Dashboard");  

  return (
    <div className="">

      {/* Main Content */}
      <main className="flex-1 p-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-blue-600 text-3xl font-bold">200</h2>
            <p>Total Order</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-red-600 text-3xl font-bold">100</h2>
            <p>Proses</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-green-600 text-3xl font-bold">100</h2>
            <p>Selesai</p>
          </div>
        </div>
        
        {/* Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Tren Order</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="blue" stroke="#3b82f6" />
              <Line type="monotone" dataKey="red" stroke="#ef4444" />
              <Line type="monotone" dataKey="brown" stroke="#a16207" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
