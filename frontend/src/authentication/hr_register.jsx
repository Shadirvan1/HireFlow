import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import publicApi from "../api/publicapi";

function HRRegister() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    company_name: "",
    website: "",
    industry: "",
    company_size: "",
    headquarters: "",
    linkedin_url: "",
    designation: "",
    department: "",
    experience_years: ""
  });

  const [errors, setErrors] = useState({});
  const [nonFieldError, setNonFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNonFieldError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setNonFieldError("");

    try {
      await publicApi.post("accounts/hr/register/", formData);
      localStorage.setItem("email")

      alert("Registered Successfully ");

      setFormData({
        email: "",
        username: "",
        password: "",
        phone_number: "",
        company_name: "",
        website: "",
        industry: "",
        company_size: "",
        headquarters: "",
        linkedin_url: "",
        designation: "",
        department: "",
        experience_years: ""
      });
      navigate("/login")

    } catch (err) {
      if (err.response?.data) {
        const backendErrors = err.response.data;

        // Field errors
        setErrors(backendErrors);

        // Non-field errors
        if (backendErrors.non_field_errors) {
          setNonFieldError(backendErrors.non_field_errors[0]);
        }
      } else {
        setNonFieldError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Input Styling
  const getInputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border transition-all duration-200 
     focus:outline-none focus:ring-2 
     ${
       errors[field]
         ? "border-red-500 focus:ring-red-300"
         : "border-gray-300 focus:ring-blue-300"
     }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl">

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          HR Registration
        </h2>

        {/* 🔴 Global Error */}
        {nonFieldError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm">
            {nonFieldError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* USER SECTION */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              User Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">


              <div>
                <input
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className={getInputClass("username")}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClass("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={getInputClass("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

    
            </div>
          </div>

          {/* COMPANY SECTION */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Company Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <input
                  name="company_name"
                  placeholder="Company Name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={getInputClass("company_name")}
                />
                {errors.company_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              <input
                name="website"
                placeholder="Website"
                value={formData.website}
                onChange={handleChange}
                className={getInputClass("website")}
              />

              <input
                name="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={handleChange}
                className={getInputClass("industry")}
              />

              <input
                name="company_size"
                placeholder="Company Size"
                value={formData.company_size}
                onChange={handleChange}
                className={getInputClass("company_size")}
              />

              <input
                name="headquarters"
                placeholder="Headquarters"
                value={formData.headquarters}
                onChange={handleChange}
                className={getInputClass("headquarters")}
              />

            </div>
          </div>

          {/* HR SECTION */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              HR Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <input
                name="linkedin_url"
                placeholder="LinkedIn URL"
                value={formData.linkedin_url}
                onChange={handleChange}
                className={getInputClass("linkedin_url")}
              />

              <input
                name="designation"
                placeholder="Designation"
                value={formData.designation}
                onChange={handleChange}
                className={getInputClass("designation")}
              />

              <input
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                className={getInputClass("department")}
              />

              <div>
                <input
                  type="number"
                  name="experience_years"
                  placeholder="Experience (Years)"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className={getInputClass("experience_years")}
                />
                {errors.experience_years && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience_years}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>
        <p className="text-center text-sm text-gray-600 mt-6"> Already have a account?{" "} <span onClick={()=>navigate("/login")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> Login </span> </p>
        <p className="text-center text-sm text-gray-600 mt-6"> Your a candidate?{" "} <span onClick={()=>navigate("/register")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> register </span> </p>
        <p className="text-center text-sm text-gray-600 mt-6"> Account{" "} <span onClick={()=>navigate("/resend/link")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> verify </span> </p>
      </div>
    </div>
  );
}

export default HRRegister;