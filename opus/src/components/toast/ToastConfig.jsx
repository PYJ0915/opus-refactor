import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastConfig() {
  return (
    <ToastContainer 
      position="top-right"   
      autoClose={2000}        
      hideProgressBar={true}  
      theme="light" 
      limit={1}
      preventDuplicates={true}               
      closeOnClick            
      pauseOnHover     
      
      icon={false}   

      // 실제 토스트 박스 내부(확인/취소 버튼 등)는 클릭이 되어야 함
      toastStyle={{
        pointerEvents: "auto", 
        color: "#111",
        fontWeight: "500"
      }}

      // 컨테이너가 헤더 좌측까지 가로 100%를 덮고 있으므로 클릭 통과 처리
      style={{ 
        zIndex: 99999, 
        top: "70px",                
        left: "50%",               
        transform: "translateX(-50%)", 
        width: "100%",             
        maxWidth: "var(--wrap)",   
        paddingRight: "var(--pad)", 
        display: "flex",            
        justifyContent: "flex-end",
        // 핵심: 컨테이너의 투명한 영역은 클릭을 무시하고 통과시킴
        pointerEvents: "none" 
      }} 
    />
  );
}