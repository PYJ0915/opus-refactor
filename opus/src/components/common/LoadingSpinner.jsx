import "../../css/loadingSpinner.css";


export default function LoadingSpinner({ text = "로딩 중" }) {
  return (
    <div className="loading-wrapper">
      <div className="dot-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <p className="loading-text">{text}</p>
    </div>
  );
}

//<LoadingSpinner text="게시글을 불러오고 있습니다!" />;
//글자 추가 가능