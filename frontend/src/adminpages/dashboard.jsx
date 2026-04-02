import React, { useState, useEffect } from 'react';
import { adminService } from './adminservice';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;
      if (tab === 'users') response = await adminService.getUsers();
      else if (tab === 'hrs') response = await adminService.getHRProfiles();
      else if (tab === 'candidates') response = await adminService.getCandidateProfiles();
      
      setData(response.data || response); // Adjust based on your API utility return structure
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">HireFlow Admin Panel</h1>
        <p className="text-gray-500 text-sm">Manage system users and professional profiles</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {['users', 'hrs', 'candidates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === tab 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading data...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Name/Email</th>
                <th className="p-4">Status</th>
                {activeTab === 'hrs' && <th className="p-4">Company</th>}
                {activeTab === 'candidates' && <th className="p-4">Location</th>}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs mr-3">
                        {item.email?.[0].toUpperCase() || (item.user_details?.email?.[0].toUpperCase())}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.username || item.user_details?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.email || item.user_details?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      (item.is_active || item.user_details?.is_active) 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {(item.is_active || item.user_details?.is_active) ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  
                  {activeTab === 'hrs' && (
                    <td className="p-4 text-sm text-gray-600">{item.company_name || 'N/A'}</td>
                  )}
                  {activeTab === 'candidates' && (
                    <td className="p-4 text-sm text-gray-600">{item.current_location}</td>
                  )}

                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-3">
                      Edit
                    </button>
                    <button className="text-gray-400 hover:text-red-600 text-xs font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;