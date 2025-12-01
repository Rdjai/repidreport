import Header from "../Header";
import Footer from "../Footer";
import {Outlet} from "react-router-dom";

const Page = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default Page;
