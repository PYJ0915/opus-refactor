import { Outlet } from "react-router-dom"
import HeaderModal from "../components/auth/HeaderModal";
import Footer from "../components/common/Footer"

export default function DarkHeaderLayout() {
  return (
    <>
      <HeaderModal variant="dark" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}