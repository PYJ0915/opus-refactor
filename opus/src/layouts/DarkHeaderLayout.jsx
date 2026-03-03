import { Outlet } from "react-router-dom"
import HeaderModal from "../components/auth/HeaderModal";
import Footer from "../components/common/Footer"
import ScrollToTop from "../components/ScrollToTop";

export default function DarkHeaderLayout() {
  return (
    <>
      <ScrollToTop />
      <HeaderModal variant="dark" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}