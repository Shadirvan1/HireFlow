import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function HRDetails() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHRDetails = async () => {
      try {
        const res = await api.get("admin/hr/details/");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching HR details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHRDetails();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`admin/hr/${id}/approve/`);
      alert("HR Approved ");
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`admin/hr/${id}/reject/`);
      alert("HR Rejected ");
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };
 console.log(data)
  if (loading) {
    return <div className="p-6 text-lg">Loading HR details...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        HR Management Panel
      </h2>

      {data.length === 0 ? (
        <p>No HR profiles found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map((hr) => (
            <div
              key={hr.id}
              className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200"
            >
             
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={hr.profile_image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-xl font-semibold">
                    {hr.user.username}
                  </h3>
                  <p className="text-gray-600">{hr.email}</p>
                  <p className="text-sm text-gray-500">
                    {hr.designation} • {hr.department}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Experience:</strong> {hr.experience_years} years</p>
                <p><strong>LinkedIn:</strong> 
                  <a
                    href={hr.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline ml-1"
                  >
                    View Profile
                  </a>
                </p>
                <p><strong>Notifications:</strong> {hr.receive_notifications ? "Enabled" : "Disabled"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border">
                <h4 className="font-semibold mb-2 text-gray-800">
                  Company Details
                </h4>

                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={hr.company.logo}
                    alt="Company Logo"
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{hr.company.name}</p>
                    <p className="text-xs text-gray-500">
                      {hr.company.industry} • {hr.company.company_size} employees
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-1">
                  <strong>HQ:</strong> {hr.company.headquarters}
                </p>

                <p className="text-sm mb-1">
                  <strong>Website:</strong>{" "}
                  <a
                    href={hr.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit
                  </a>
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  {hr.company.description}
                </p>
              </div>

              <div className="mb-4">
                <a
                  href={hr.certifications}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Certification
                </a>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(hr.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(hr.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}