import React, { useEffect, useState } from "react";
import api from "../../api/api";

export default function InviteManagement() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [invitingRole, setInvitingRole] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("management/get/all/employees/");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const sendInvite = async (role) => {
    try {
      setInvitingRole(role);
      const res = await api.post(`accounts/invite/${role}/`);
      setInviteLink(res.data.invite_link);
    } catch (error) {
      alert("Failed to generate invite link");
    } finally {
      setInvitingRole(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`management/user/${id}/toggle-activity/`);
      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, is_active: res.data.is_active } : user,
      );
      setUsers(updatedUsers);
      alert("Toggeled successfully");
    } catch (err) {
      console.error("Failed to update user activity", err);
      alert("Failed to update user activity");
    }
  };
  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await api.patch(`management/user/${id}/change/role/`, {
        role: newRole,
      });

      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, role: res.data.role } : user,
      );
      setUsers(updatedUsers);
      alert(`Role updated to ${res.data.role}`);
    } catch (err) {
      console.error("Failed to update role", err.response);
      alert("Failed to update role");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            User & Invite Management
          </h1>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Generate Invitation
          </h2>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => sendInvite("HR")}
              disabled={invitingRole === "HR"}
              className="px-6 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              {invitingRole === "HR" ? "Generating..." : "Invite HR"}
            </button>

            <button
              onClick={() => sendInvite("INTERVIEWER")}
              disabled={invitingRole === "INTERVIEWER"}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              {invitingRole === "INTERVIEWER"
                ? "Generating..."
                : "Invite Interviewer"}
            </button>
          </div>

          {inviteLink && (
            <div className="mt-6 bg-gray-50 border rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate w-4/5">
                {inviteLink}
              </span>

              <button
                onClick={copyToClipboard}
                className="ml-4 px-4 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Company Users
          </h2>

          {loadingUsers ? (
            <div className="text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm text-gray-600">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {user.user.username}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{user.email}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              user.role === "HR"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {user.role}
                          </span>

                          <div className="relative inline-block text-left">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                              className="ml-2 border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 cursor-pointer"
                            >
                              <option value="HR" disabled>------</option>
                              <option value="HR">HR</option>
                              <option value="INTERVIEWER">INTERVIEWER</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(user.id)}
                          className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                            user.is_active
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
