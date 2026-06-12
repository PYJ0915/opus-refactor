import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Selections from "./pages/selections/Selections";
import SelectionsDetail from "./pages/selections/SelectionsDetail";
import Cart from "./pages/selections/Cart";
import Checkout from "./pages/selections/Checkout";
import PaymentSuccess from "./pages/selections/PaymentSuccess";
import PaymentFail from "./pages/selections/PaymentFail";
import DarkHeaderLayout from "./layouts/DarkHeaderLayout";
import LightHeaderLayout from "./layouts/LightHeaderLayout";
import Unveiling from "./pages/Unveiling";
import OnStage from "./pages/onStage/OnStage";
import UnveilingDetail from "./pages/UnveilingDetail";
import MusicalDetail from './pages/onStage/MusicalDetail';
import Reviews from "./pages/onStage/Reviews";
import Proposals from "./pages/Proposals/Proposals";
import ToastConfig from "./components/toast/ToastConfig";
import AuthInitializer from "./components/common/AuthInitializer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyPage from "./pages/mypage/MyPage";
import ExhibitionDetail from "./pages/onStage/ExhibitionDetail";
import Orders from "./pages/selections/Orders";
import OrderDetail from "./pages/selections/OrderDetail";
import AuthSuccess from "./components/auth/AuthSuccess";
import ProposalDetail from "./pages/Proposals/ProposalDetail";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/common/ScrollToTop";
import ProposalWrite from "./pages/Proposals/ProposalWrite";
import SavedList from "./pages/mypage/SavedList";
import ReviewList from "./pages/mypage/ReviewList";
import UnveilingHistory from "./pages/mypage/UnveilingHistory";
import FAQ from "./pages/footer/FAQ";
import Terms from "./pages/footer/Terms";
import About from "./pages/footer/About";
import Privacy from "./pages/footer/Privacy";
import Admin from "./pages/admin/Admin";
import MyPosts from "./pages/mypage/MyPosts";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import MyPageLayout from "./layouts/MyPageLayout";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Search from "./pages/Search";
import CompanyDashboard from "./pages/mypage/CompanyDashboard";
import RecommendPanel from "./components/RecommendPanel";

export default function App() {

  const navigate = useNavigate();

  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);

  useEffect(() => {
    const handleAuthExpired = (e) => {
      toast.error(e.detail.message, { toastId: "auth-expired" });
      navigate("/", { replace: true });
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, [navigate]);


  return (
    <>
      <AuthInitializer />
      <ToastConfig />

      <Routes>
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Dark Header 레이아웃 */}
        <Route element={<DarkHeaderLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Light Header 레이아웃 */}
        <Route element={<LightHeaderLayout />}>
          <Route path="/onStage" element={<OnStage />} />
          <Route path="/onStage/exhibition/:exhibitionId" element={<ExhibitionDetail />} />
          <Route path="/onStage/musical/:mt20id" element={<MusicalDetail />} />
          <Route path="/onStage/reviews/:stageNo" element={<Reviews />} />

          <Route path="/Proposals" element={<Proposals />} />
          <Route path="/Proposals/write" element={<ProtectedRoute><ProposalWrite /></ProtectedRoute>} />
          <Route path="/Proposals/detail/:boardNo" element={<ProposalDetail />} />
          <Route path="/Proposals/edit/:boardNo" element={<ProtectedRoute><ProposalWrite /></ProtectedRoute>} />
          <Route path="/Proposals/edit" element={<ProtectedRoute><ProposalWrite /></ProtectedRoute>} />

          <Route path="/unveiling" element={<Unveiling />} />
          <Route path="/unveiling/:id" element={<UnveilingDetail />} />

          <Route path='/selections' element={<Selections />} />
          <Route path='/selections/:goodsNo' element={<SelectionsDetail />} />
          <Route path='/selections/cart' element={<Cart />} />
          <Route path='/selections/checkout' element={<Checkout />} />

          <Route path='/payment/success' element={<PaymentSuccess />} />
          <Route path='/payment/fail' element={<PaymentFail />} />

          <Route element={<ProtectedRoute><MyPageLayout /></ProtectedRoute>}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/orders" element={<Orders />} />
            <Route path="/mypage/orders/:orderNo" element={<OrderDetail />} />
            <Route path="/mypage/wishlist" element={<SavedList />} />
            <Route path="/mypage/reviews" element={<ReviewList />} />
            <Route path="/mypage/auction-history" element={<UnveilingHistory />} />
            <Route path="/mypage/myPosts" element={<MyPosts />} />
          </Route>

          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
          <Route path="/search" element={<Search />} />
          <Route path="/mypage/dashboard"
            element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
        </Route>
      </Routes>

      <RecommendPanel
        isOpen={recommendOpen}
        onToggle={() => {
          setRecommendOpen((v) => !v);
          if (chatbotOpen) setChatbotOpen(false);
        }}
        onClose={() => setRecommendOpen(false)}
        hidden={chatbotOpen}
      />
      <Chatbot
        isOpen={chatbotOpen}
        onToggle={() => {
          setChatbotOpen((v) => !v);
          if (recommendOpen) setRecommendOpen(false);
        }}
        onClose={() => setChatbotOpen(false)}
        hidden={recommendOpen}
      />
      <ScrollToTop />
    </>
  );
}