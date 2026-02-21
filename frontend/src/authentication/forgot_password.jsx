import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("accounts/forgot-password/", {
        email: email,
      });

      setMessage(res.data.message);
      setTimeout(()=>{
       navigate("/login") 
      },1000)
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-900 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Forgot Password 🔑
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your registered email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
        )}

        {message && (
          <p className="mt-4 text-green-600 text-sm text-center">{message}</p>
        )}
      </div>
    </div>
  );
}