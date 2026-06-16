import { Outlet } from "react-router-dom";
import MyPageSidebar from "../components/common/MyPageSidebar";
import "../css/myPageLayout.css";

export default function MyPageLayout() {
  return (
    <div className="mypage-layout">
      <MyPageSidebar />
      <div className="mypage-layout__main">
        <Outlet />
      </div>
    </div>
  );
}