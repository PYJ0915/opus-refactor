import HeaderModal from "../components/auth/HeaderModal";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";

export default function LightHeaderLayout() {
  return (
    <>
      <HeaderModal variant="light" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}