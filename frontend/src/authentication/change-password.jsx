import React, { useState } from 'react';
import api from '../api/api';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      const response = await api.post('accounts/user/change-password/', formData);
      setMessage({ type: 'success', text: response.data.message || "Password updated successfully!" });
      setFormData({ old_password: '', new_password: '', confirm_password: '' });
      
      // Optional: Delay navigation slightly so they see the success message
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
        setMessage({ type: 'error', text: "Please fix the errors below." });
      } else {
        setMessage({ type: 'error', text: "Something went wrong. Try again later." });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Back Button Container */}
      <div className="absolute top-8 left-4 sm:left-8">
        <button
          onClick={() => navigate(-1)} // Takes user back to previous page
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm group"
        >
          <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm group-hover:bg-gray-50">
            <ArrowLeft size={18} />
          </div>
          <span>Back</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Update Security
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ensure your account stays protected with a strong password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10">
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Input fields remain the same */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="mt-1 relative">
                <input
                  name="old_password"
                  type={showPass.old ? "text" : "password"}
                  required
                  value={formData.old_password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.old_password ? 'border-red-300' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => toggleVisibility('old')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPass.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.old_password && <p className="mt-1 text-xs text-red-600">{errors.old_password}</p>}
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <input
                  name="new_password"
                  type={showPass.new ? "text" : "password"}
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.new_password ? 'border-red-300' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => toggleVisibility('new')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.new_password && (
                <ul className="mt-1 text-xs text-red-600 list-disc pl-4">
                  {Array.isArray(errors.new_password) ? errors.new_password.map((err, i) => <li key={i}>{err}</li>) : <li>{errors.new_password}</li>}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="mt-1 relative">
                <input
                  name="confirm_password"
                  type={showPass.confirm ? "text" : "password"}
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => toggleVisibility('confirm')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm_password && <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;