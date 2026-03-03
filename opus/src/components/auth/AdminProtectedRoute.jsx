import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "./useAuthStore";

export default function AdminProtectedRoute({ children }) {
  const { token, member } = useAuthStore();

  if (!token) {
    if (!toast.isActive("auth-required")) {
      toast.error("관리자만 이용 가능합니다.", {
        toastId: "auth-required",
      });
    }
    return <Navigate to="/" replace />;
  }

  if (member?.role !== "ADMIN") {
    if (!toast.isActive("admin-only")) {
      toast.error("관리자만 접근 가능합니다.", {
        toastId: "admin-only",
      });
    }
    return <Navigate to="/" replace />;
  }

  return children;
}