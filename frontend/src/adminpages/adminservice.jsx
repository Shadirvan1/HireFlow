import api from "../api/api";

export const adminService = {
  // Users
  getUsers: () => api.get("/admin/users/"),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  
  // Companies
  getCompanies: () => api.get("/admin/companies/"),
  
  // Profiles
  getHRProfiles: () => api.get("/admin/hr-profiles/"),
  getCandidateProfiles: () => api.get("/admin/candidate-profiles/"),
};