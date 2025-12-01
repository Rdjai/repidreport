import {useContext} from "react";
import AdminContext from "@/context/AdminContext";

// Custom hook to use the AdminContext
export const useAdmin = () => {
  return useContext(AdminContext)!;
};
