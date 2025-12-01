import {Outlet} from "react-router-dom";
import Header from "../Header";

const AdminLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default AdminLayout;
