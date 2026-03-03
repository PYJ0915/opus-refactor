import HeaderModal from "../components/auth/HeaderModal";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

export default function LightHeaderLayout() {
  return (
    <>
      <ScrollToTop />
      <HeaderModal variant="light" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}