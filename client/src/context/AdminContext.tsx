import {createContext, useState} from "react";

import type {AdminState, AdminUser} from "@/types";

export type {AdminState, AdminUser};

const AdminContext = createContext<AdminState | undefined>(undefined);

export const AdminProvider = ({children}: AdminProviderProps) => {
  const [admin, setAdminState] = useState<AdminUser | null>(() => { // 
    const savedAdmin = localStorage.getItem("adminUser"); // 
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const setAdmin = (adminData: AdminUser | null) => {
    if (adminData) {
      localStorage.setItem("adminUser", JSON.stringify(adminData));
    } else {
      localStorage.removeItem("adminUser");
    }
    setAdminState(adminData);
  };

  const clearAdmin = () => {
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{admin, setAdmin, clearAdmin}}>
      {children}
    </AdminContext.Provider>
  );
};
export default AdminContext;
