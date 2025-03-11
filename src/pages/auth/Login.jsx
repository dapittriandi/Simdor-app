import { useState } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {

      const lowerEmail = email.toLowerCase(); // Konversi email ke lowercase

      // 🔐 Login ke Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, lowerEmail, password);
      const user = userCredential.user;

      // 🔎 Ambil data user dari Firestore berdasarkan email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", lowerEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data(); // Ambil data pertama
        const { peran, bidang } = userData;

        // 💾 Simpan user ke localStorage agar bisa digunakan di sidebar, dll
        localStorage.setItem("user", JSON.stringify(userData));

        // 📌 **Redirect berdasarkan peran**
        if (peran === "customer service") {
          navigate("/dashboard-cs");
        } else if (peran === "admin keuangan") {
          navigate("/dashboard-keuangan");
        } else if (peran === "admin portofolio") {
          // **Arahkan ke dashboard dulu, bukan langsung ke orders**
          navigate("/dashboard-portofolio");
        } else if (peran === "koordinator") {
          navigate("/dashboard-koordinator");
        } else {
          setError("Peran tidak dikenali.");
        }
      } else {
        setError("Data pengguna tidak ditemukan di Firestore.");
      }
    } catch (err) {
      setError("Login gagal. Periksa email dan password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
