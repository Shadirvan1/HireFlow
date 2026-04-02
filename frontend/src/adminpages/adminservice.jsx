import api from "../api/api";

export const adminService = {
  // Users
  getUsers: () => api.get("/admin/users/users/"),
  updateUser: (id, data) => api.put(`/admin/users/users/${id}/`, data),
  
  
  getCompanies: () => api.get("/admin/users/companies/"),
  
  // Profiles
  getHRProfiles: () => api.get("/admin/users/hr-profiles/"),
  getCandidateProfiles: () => api.get("/admin/users/candidate-profiles/"),
};