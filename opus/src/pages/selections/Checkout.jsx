/* Checkout.jsx */
import { useEffect, useRef, useState } from "react";
import "../../css/Checkout.css";
import AddressModal from "./AddressModal";
import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from 'react-daum-postcode'; // 다음 주소 API
import { useAddressStore } from "../../store/useAddressStore";

// 토스페이먼츠 연동
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { orderApi } from "../../api/orderAPI";
import ScrollToTop from "../../components/common/ScrollToTop";

const Checkout = () => {

  // 장바구니 상품 얻어오기
  const items = useCartStore((state) => state.items);

  // 장바구니에서 체크된 키 얻어오기
  const checkedKeys = useCartStore((state) => state.checkedKeys);

  // 배송지 목록, 선택된 배송지 아이디, 서버에 저장된 배송지 목록
  const { addresses, selectedAddressId, fetchAddresses } = useAddressStore();

  // 배송지 모달 열림 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 배송 메모 직접입력 선택 여부
  const [onTextarea, setOnTextarea] = useState(false);

  // 배송메모 폼 상태
  const [form, setForm] = useState({
    email: "",
    ordererName: "",
    recipient: "",
    recipientTel: "",
    postcode: "",
    basicAddress: "",
    detailAddress: "",
    deliveryReq: ""
  });

  // 배송 메모 관련 상태
  const [selectedMemoType, setSelectedMemoType] = useState("");  // select 전용
  const [customMemo, setCustomMemo] = useState("");  // textarea 전용

  // 결제 방법 상태
  const [paymentMethod, setPaymentMethod] = useState("카드/간편");

  // 결제 진행중 상태
  const [isProcessing, setIsProcessing] = useState(false);

  // 약관 동의 상태
  const [agreements, setAgreements] = useState({
    policy: false,
    privacy: false
  });

  // 입력 필드 에러 상태
  const [fieldErrors, setFieldErrors] = useState({});

  // 장바구니에서 체크된 상품들
  const selectedItems = items.filter(item => checkedKeys.includes(item.cartKey));

  // 가격 모음

  // 상품 총 가격
  const goodsTotalChecked = selectedItems.reduce(
    (sum, i) => sum + i.unitPrice * i.qty,
    0
  );

  // 배송비는 한 번만
  let shippingTotalChecked = 0;

  if (selectedItems.length > 0) {
    shippingTotalChecked = selectedItems[0].deliveryCost ?? 0;
  }

  // 무료배송 조건
  if (goodsTotalChecked >= 50000) {
    shippingTotalChecked = 0;
  }

  const grandTotalChecked = goodsTotalChecked + shippingTotalChecked;


  // 페이지 이동 파트
  const navigate = useNavigate();

  // 장바구니 이동
  const onGoCart = () => {
    navigate("/selections/cart");
  }

  // 진입 시 배송지 목록 로드 (기본배송지 selectedAddressId 세팅되게)
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // selectedAddressId가 바뀔 때마다 기본 배송지 정보로 form 초기화
  useEffect(() => {

    // 선택한 주소의 번호와 주소 목록 중 주소 번호가 같은 주소 반환
    const selectedAddr = addresses.find(a => a.addressNo === selectedAddressId);

    // 선택 주소가 있으면 해당 주소 입력
    if (selectedAddr) {
      setForm({
        recipient: selectedAddr.recipient,
        recipientTel: selectedAddr.recipientTel,
        email: form.email,
        ordererName: form.ordererName,
        postcode: selectedAddr.postcode,
        basicAddress: selectedAddr.basicAddress,
        detailAddress: selectedAddr.detailAddress ?? "",
        deliveryReq: selectedAddr.deliveryReq ?? ""
      });

      // 배송 메모가 미리 정의된 옵션인지 확인
      const predefinedOptions = [
        "문 앞에 놓아주세요",
        "경비실에 맡겨주세요",
        "배송 전 연락 부탁드려요"
      ];

      // 미리 정의된 옵션에 따른 배송 메모 UI 변경
      if (selectedAddr.deliveryReq &&
        !predefinedOptions.includes(selectedAddr.deliveryReq)) {
        // 미리 정의되지 않은 메모 = 직접 입력
        setSelectedMemoType("직접 입력");
        setCustomMemo(selectedAddr.deliveryReq);
        setOnTextarea(true);
      } else {
        setSelectedMemoType(selectedAddr.deliveryReq ?? "");
        setCustomMemo("");
        setOnTextarea(false);
      }
    }
  }, [selectedAddressId, addresses]);

  // 배송메모 선택에 따른 UI 변경
  const handleMemoSelect = (e) => {
    const value = e.target.value;
    setSelectedMemoType(value);
    setOnTextarea(value === "직접 입력");

    // "직접 입력"이 아니면 deliveryReq 즉시 설정
    if (value !== "직접 입력") {
      setForm(prev => ({
        ...prev,
        deliveryReq: value
      }));
      setCustomMemo("");  // 커스텀 메모 초기화
    } else {
      setForm(prev => ({
        ...prev,
        deliveryReq: ""  // 비우기 (사용자가 입력할 예정)
      }));
      setCustomMemo("");
    }
  };

  // 직접입력 메모 핸들러
  const handleCustomMemoChange = (e) => {
    const value = e.target.value;
    setCustomMemo(value);
    setForm(prev => ({
      ...prev,
      deliveryReq: value
    }));
  };

  // 선택한 배송지 적용 핸들러
  const handleApplyAddress = (addressNo) => {
    const addr = addresses.find(
      a => a.addressNo === addressNo
    );
    if (!addr) return;

    setForm({
      recipient: addr.recipient,
      recipientTel: addr.recipientTel,
      postcode: addr.postcode,
      basicAddress: addr.basicAddress,
      detailAddress: addr.detailAddress ?? "",
      deliveryReq: addr.deliveryReq ?? ""
    });

    // 미리 정의된 배송 메모
    const predefinedOptions = [
      "문 앞에 놓아주세요",
      "경비실에 맡겨주세요",
      "배송 전 연락 부탁드려요"
    ];

    if (addr.deliveryReq && !predefinedOptions.includes(addr.deliveryReq)) {
      // 직접 입력한 메모
      setSelectedMemoType("직접 입력");
      setCustomMemo(addr.deliveryReq);
      setOnTextarea(true);
    } else {
      // 미리 정의된 메모 또는 없음
      setSelectedMemoType(addr.deliveryReq ?? "");
      setCustomMemo("");
      setOnTextarea(false);
    }

    setIsModalOpen(false);
  };


  // ====== 다음 주소 API ======
  const open = useDaumPostcodePopup(import.meta.env.VITE_DAUM_API);

  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';
    let postcode = data.zonecode;

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setForm(prev => ({
      ...prev,
      basicAddress: fullAddress,
      postcode,
      detailAddress: "",
      deliveryReq: ""
    }));

  };

  // 주소 검색 버튼 클릭 함수
  const handleClick = () => {
    open({ onComplete: handleComplete });
  };

  // ======= 토스 페이먼츠 API 파트 =======

  // 토스페이먼츠 객체
  const tossPaymentsRef = useRef(null);

  // 토스페이먼츠 초기화
  useEffect(() => {
    const initializeTossPayments = async () => {
      try {
        console.log("==== 토스페이먼츠 초기화 시작 ====");
        const tossPayments = await loadTossPayments(
          import.meta.env.VITE_TOSS_CLIENT_KEY
        );
        tossPaymentsRef.current = tossPayments;
        console.log("==== 토스페이먼츠 초기화 완료 ====");
      } catch (error) {
        console.error("토스페이먼츠 초기화 실패:", error);
        alert("결제 시스템 초기화에 실패했습니다.");
      }
    }

    initializeTossPayments();
  }, []);

  // 결제 검증 함수
  const validatePayment = () => {
    const errors = {};

    // 필수 정보 확인
    if (!form.recipient) {
      errors.recipient = true;
    }
    if (!form.recipientTel) {
      errors.recipientTel = true;
    }
    if (!form.postcode || !form.basicAddress) {
      errors.address = true;
    }
    if (!form.email) {
      errors.email = true;
    }
    if (!form.ordererName) {
      errors.ordererName = true;
    }
    if (!agreements.policy) {
      errors.policy = true;
    }
    if (!agreements.privacy) {
      errors.privacy = true;
    }
    if (selectedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return false;
    }

    // 에러가 있으면 상태 업데이트 및 첫 번째 에러 필드로 포커스
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // 첫 번째 에러 필드로 스크롤 및 포커스
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);

      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // input 요소면 포커스
        if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA') {
          setTimeout(() => errorElement.focus(), 300);
        }
      }

      alert("필수 입력 정보를 모두 입력해주세요.");
      return false;
    }

    // 에러 없으면 초기화
    setFieldErrors({});
    return true;
  };

  // 결제 요청 핸들러
  const handlePayment = async () => {

    // 결제 전 검증
    // 검증
    if (!validatePayment()) return;
    if (isProcessing) return;  // 중복 클릭 방지

    setIsProcessing(true);

    try {

      // 1. 백엔드에 주문 생성
      const orderData = {
        items: selectedItems.map(item => ({
          goodsNo: item.goodsNo,
          goodsOptionNo: item.goodsOptionNo,
          qty: item.qty,
          unitPrice: item.unitPrice,
          version: item.version ?? 0,
        })),
        recipient: form.recipient,
        recipientTel: form.recipientTel,
        postcode: form.postcode,
        basicAddress: form.basicAddress,
        detailAddress: form.detailAddress,
        deliveryReq: form.deliveryReq,
        email: form.email,
        ordererName: form.ordererName,
        totalAmount: grandTotalChecked,
        paymentMethod: paymentMethod
      }

      console.log("==== 주문 생성 시작 ====");
      const response = await orderApi.createOrder(orderData);

      console.log("주문 생성 완료", response)

      const { orderId, orderName, amount } = response;

      // 2. 결제 수단별 처리
      if (paymentMethod === "무통장 입금") {
        // 가상계좌 결제
        await handleVirtualAccountPayment(orderId, orderName, amount);
      } else {
        // 카드-간편 결제
        await handleCardOrEasyPayment(orderId, orderName, amount);
      }

    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert(error.response?.data?.message || "결제 요청에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }

  };

  // 카드-간편 결제 처리
  const handleCardOrEasyPayment = async (orderId, orderName, amount) => {
    if (!tossPaymentsRef.current) {
      alert("결제 시스템이 초기화되지 않았습니다.");
      return;
    }

    try {
      console.log("==== 카드 / 간편 결제창 호출 시작 ====");
      await tossPaymentsRef.current.requestPayment("카드", {
        amount: amount,
        orderId: orderId,
        orderName: orderName,
        customerName: form.ordererName,
        customerEmail: form.email,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`
      });
    } catch (error) {
      console.error("결제창 호출 실패:", error);

       if (error.code === "USER_CANCEL") {
        alert("결제가 취소되었습니다.");
        return;
      }

      alert("결제창 호출에 실패했습니다.");
    }
  };

  // 가상 계좌 결제 처리
  const handleVirtualAccountPayment = async (orderId, orderName, amount) => {
    if (!tossPaymentsRef.current) {
      alert("결제 시스템이 초기화되지 않았습니다.");
      return;
    }

    try {
      console.log("==== 가상계좌 발급 시작 ====");
      await tossPaymentsRef.current.requestPayment("가상계좌", {
        amount: amount,
        orderId: orderId,
        orderName: orderName,
        customerName: form.ordererName,
        customerEmail: form.email,
        validHours: 24,  // 입금 유효 시간 (24시간)
        cashReceipt: {
          type: "소득공제"  // 현금영수증 타입
        },
        successUrl: `${location.origin}/payment/success`,
        failUrl: `${location.origin}/payment/fail`
      });
    } catch (error) {
      console.error("가상계좌 발급 실패:", error);

      if (error.code === "USER_CANCEL") {
        alert("결제가 취소되었습니다.");
        return;
      }

      alert("가상계좌 발급에 실패했습니다.");
    }
  };


  return (
    <main className="main checkout">
      <section className="checkout_hero">
        <h1 className="checkout_hero_title">결제</h1>
        <p className="checkout_hero_sub">
          배송 정보와 결제 수단을 확인한 뒤 주문을 완료해 주세요.
        </p>
      </section>

      <section className="checkout_wrap">
        <div className="checkout_left">
          {/* 주문 상품 */}
          <section className="checkout_card checkout_orderCard">
            <div className="checkout_card__head">
              <h2 className="checkout_card__title">주문 상품</h2>
              <button className="checkout_card__link" onClick={onGoCart}>장바구니로 돌아가기</button>
            </div>

            {selectedItems.map((item) => (
              <div className="checkout_mini-items" key={item.cartKey}>
                <div className="checkout_mini-item">
                  <div className="checkout_mini-item__thumb">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.thumbnail}`}
                      alt={item.goodsName}
                    />
                  </div>
                  <div className="checkout_mini-item__info">
                    <p className="checkout_mini-item__name">{item.goodsName}</p>
                    <p className="checkout_mini-item__meta">
                      수량 <strong>{item.qty}</strong>
                      {item.color && (
                        <>
                          <span className="dot">·</span>
                          <span>
                            {item.color || ""}
                            {item.size
                              ? ` / ${item.size}`
                              : ""}
                          </span>
                        </>
                      )}</p>
                  </div>
                  <p className="checkout_mini-item__price">{Number(item.unitPrice).toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </section>

          {/* 배송 정보 */}
          <section className="checkout_card">
            <div className="checkout_card__head">
              <div>
                <h2 className="checkout_card__title">배송 정보</h2>
                <p className="checkout_card__desc">정확한 배송을 위해 정보를 확인해 주세요.</p>
              </div>

              <button className="ghost-btn" type="button" id="openAddressModal" onClick={() => setIsModalOpen(true)}>
                저장 배송지 불러오기
              </button>
            </div>

            <form className="checkout_form" action="#" method="post">
              <div className="checkout_grid">
                <div className="checkout_field">
                  <label className="checkout_label" htmlFor="receiver">수령인</label>
                  <input
                    className={`checkout_input ${fieldErrors.recipient ? 'checkout_input--error' : ''}`}
                    id="recipient"
                    type="text"
                    placeholder="이름"
                    value={form.recipient}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, recipient: e.target.value }));
                      setFieldErrors(prev => ({ ...prev, recipient: false }));
                    }}
                  />
                </div>

                <div className="checkout_field">
                  <label className="checkout_label" htmlFor="phone">연락처</label>
                  <input
                    className={`checkout_input ${fieldErrors.recipientTel ? 'checkout_input--error' : ''}`}
                    id="recipientTel"
                    type="tel"
                    placeholder="010-0000-0000"
                    value={form.recipientTel}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, recipientTel: e.target.value }));
                      setFieldErrors(prev => ({ ...prev, recipientTel: false }));
                    }}
                  />
                </div>
              </div>

              <div className="checkout_grid">
                <div className="checkout_field checkout_field--wide">
                  <label className="checkout_label" htmlFor="addr1">주소</label>
                  <div className="checkout_addr-row">
                    <input
                      className={`checkout_input ${fieldErrors.address ? 'checkout_input--error' : ''}`}
                      id="address"
                      type="text"
                      placeholder="우편번호"
                      value={form.postcode}
                      readOnly
                    />
                    <button
                      className="checkout_btn checkout_btn--outline checkout_btn--sm"
                      type="button"
                      onClick={() => {
                        handleClick();
                        setFieldErrors(prev => ({ ...prev, address: false }));
                      }}
                    >
                      주소 검색
                    </button>
                  </div>
                </div>

                <div className="checkout_field checkout_field--wide">
                  <input
                    className={`checkout_input ${fieldErrors.address ? 'checkout_input--error' : ''}`}
                    type="text"
                    placeholder="기본 주소"
                    value={form.basicAddress}
                    readOnly
                  />
                </div>

                <div className="checkout_field checkout_field--wide">
                  <input className="checkout_input" type="text" placeholder="상세 주소"
                    value={form.detailAddress} onChange={(e) => { setForm(prev => ({ ...prev, detailAddress: e.target.value })) }} />
                </div>
              </div>

              <div className="checkout_field">
                <label className="checkout_label" htmlFor="memo">배송 메모</label>
                <select className="checkout_select" id="memo" value={selectedMemoType} onChange={handleMemoSelect} >
                  <option value="">선택 안 함</option>
                  <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                  <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                  <option value="배송 전 연락 부탁드려요">배송 전 연락 부탁드려요</option>
                  <option value="직접 입력">직접 입력</option>
                </select>
                {onTextarea && (
                  <textarea
                    className="checkout_textarea"
                    value={customMemo}
                    onChange={handleCustomMemoChange}
                    placeholder="직접 입력(선택)"
                    rows="3"
                  />
                )}
              </div>
            </form>
          </section>

          {/* 배송 */}
          <section className="checkout_card">
            <div className="checkout_card__head">
              <h2 className="checkout_card__title">배송</h2>
              <p className="checkout_card__desc">출고 전 품질 점검 후 발송됩니다.</p>
            </div>

            <div className="checkout_ship">
              <div className="checkout_ship__row">
                <span className="checkout_ship__k">배송 방법</span>
                <span className="checkout_ship__v">택배 배송</span>
              </div>
              <div className="checkout_ship__row">
                <span className="checkout_ship__k">배송 지역</span>
                <span className="checkout_ship__v">대한민국 전 지역</span>
              </div>
              <div className="checkout_ship__row">
                <span className="checkout_ship__k">배송비</span>
                <span className="checkout_ship__v">
                  <strong>{Number(shippingTotalChecked).toLocaleString()}원</strong>
                </span>
              </div>
              <div className="checkout_ship__row">
                <span className="checkout_ship__k">배송 기간</span>
                <span className="checkout_ship__v">결제 완료 후 영업일 기준 1–3일 이내 출고</span>
              </div>

              <div className="checkout_notice">
                <i className="fa-solid fa-circle-info"></i>
                <p>
                  주문 폭주, 제작 일정, 택배사 사정에 따라 배송이 지연될 수 있으며,
                  지연 발생 시 개별 안내드립니다.
                </p>
              </div>
            </div>
          </section>

          {/* 결제 수단 */}
          <section className="checkout_card">
            <div className="checkout_card__head">
              <h2 className="checkout_card__title">결제 수단</h2>
              <p className="checkout_card__desc">원하시는 결제 방법을 선택해 주세요.</p>
            </div>

            <div className="checkout_pay">
              <div className="checkout_pay__methods">
                <label className="checkout_radio">
                  <input
                    type="radio"
                    name="payMethod"
                    value="카드/간편"
                    checked={paymentMethod === "카드/간편"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>카드 / 간편 결제</span>
                </label>
                <label className="checkout_radio">
                  <input
                    type="radio"
                    name="payMethod"
                    value="무통장 입금"
                    checked={paymentMethod === "무통장 입금"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>무통장 입금</span>
                </label>
              </div>

              <div className="checkout_pay__box">
                <div className="checkout_grid">
                  <div className="checkout_field">
                    <label className="checkout_label" htmlFor="email">이메일(영수증)</label>
                    <input
                      className={`checkout_input ${fieldErrors.email ? 'checkout_input--error' : ''}`}
                      id="email"
                      type="email"
                      placeholder="example@opus.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, email: e.target.value }));
                        setFieldErrors(prev => ({ ...prev, email: false }));
                      }}
                      required
                    />
                  </div>

                  <div className="checkout_field">
                    <label className="checkout_label" htmlFor="name">주문자</label>
                    <input
                      className={`checkout_input ${fieldErrors.ordererName ? 'checkout_input--error' : ''}`}
                      id="ordererName"
                      type="text"
                      placeholder="이름"
                      value={form.ordererName}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, ordererName: e.target.value }));
                        setFieldErrors(prev => ({ ...prev, ordererName: false }));
                      }}
                      required
                    />
                  </div>
                </div>

                {/* 무통장 입금 안내 */}
                {paymentMethod === "무통장 입금" && (
                  <div className="checkout_notice">
                    <i className="fa-solid fa-circle-info"></i>
                    <p>
                      결제 후 발급된 가상계좌로 24시간 이내 입금해주세요.
                      입금 확인 후 주문이 확정됩니다.
                    </p>
                  </div>
                )}

                {/* 카드/간편결제 안내 */}
                {paymentMethod === "카드/간편" && (
                  <div className="checkout_notice">
                    <i className="fa-solid fa-circle-info"></i>
                    <p>
                      결제창에서 신용카드, 체크카드, 또는 카카오페이/네이버페이 등 간편결제를 선택하실 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 정책 */}
          <section className="checkout_card">
            <div className="checkout_card__head">
              <h2 className="checkout_card__title">배송/교환/반품 정책</h2>
              <p className="checkout_card__desc">OPUS는 세련된 경험과 신뢰 가능한 운영 기준을 함께 제공합니다.</p>
            </div>

            <details className="checkout_policy" open>
              <summary className="checkout_policy__summary">배송 안내</summary>
              <div className="checkout_policy__body">
                <ul className="checkout_policy__list">
                  <li><strong>배송 방법:</strong> 택배 배송</li>
                  <li><strong>배송 지역:</strong> 대한민국 전 지역</li>
                  <li><strong>배송 비용:</strong> 기본 배송비 3,000원 / 일정 금액 이상 구매 시 무료(상세 기준은 결제 페이지 참고)</li>
                  <li><strong>배송 기간:</strong> 결제 완료 후 영업일 기준 1–3일 이내 출고 (출고 후 1–2일 추가 소요 가능)</li>
                </ul>
                <p className="checkout_policy__note">
                  ※ 주문 폭주, 제작 일정, 택배사 사정에 따라 배송이 지연될 수 있으며, 지연 발생 시 개별 안내드립니다.
                </p>
              </div>
            </details>

            <details className="checkout_policy">
              <summary className="checkout_policy__summary">교환 및 반품 안내</summary>
              <div className="checkout_policy__body">
                <div className="checkout_policy__cols">
                  <div>
                    <p className="checkout_policy__lead">교환·반품이 가능한 경우</p>
                    <ul className="checkout_policy__list">
                      <li>상품 수령일로부터 7일 이내 요청</li>
                      <li>착용/사용 흔적 및 훼손이 없는 경우</li>
                      <li>구성품(케이스, 포장재, 사은품 등) 보존</li>
                    </ul>
                  </div>
                  <div>
                    <p className="checkout_policy__lead">교환·반품이 불가능한 경우</p>
                    <ul className="checkout_policy__list">
                      <li>부주의로 훼손되거나 가치가 감소한 경우</li>
                      <li>착용 또는 사용 흔적이 확인되는 경우</li>
                      <li>수령 후 7일 경과</li>
                      <li>주문 제작/별도 안내된 교환·반품 불가 상품</li>
                    </ul>
                  </div>
                </div>

                <p className="checkout_policy__note">
                  <strong>배송비:</strong> 단순 변심은 왕복 배송비 고객 부담 / 불량·오배송은 OPUS 부담<br />
                  ※ 반품 배송비는 최초 배송비 결제 여부에 따라 차감 또는 별도 입금 안내될 수 있습니다.
                </p>

                <ol className="checkout_policy__steps">
                  <li>고객센터 또는 마이페이지를 통해 교환·반품 신청</li>
                  <li>안내에 따라 상품 회수 진행</li>
                  <li>상품 상태 확인 후 교환 또는 환불 처리</li>
                </ol>

                <p className="checkout_policy__note">※ 사전 접수 없이 임의 반송 시 처리가 지연될 수 있습니다.</p>
              </div>
            </details>

            <details className="checkout_policy">
              <summary className="checkout_policy__summary">환불 안내</summary>
              <div className="checkout_policy__body">
                <p className="checkout_policy__note">
                  반품 상품이 OPUS에 도착하여 검수 완료 후 영업일 기준 3–5일 이내 환불이 진행됩니다.
                  카드사 및 결제 수단에 따라 실제 환불 시점은 다소 차이가 있을 수 있습니다.
                </p>
                <p className="checkout_policy__note">
                  OPUS는 출고 전 꼼꼼하게 검수하며, 고객님께 전달되는 순간까지 품질을 가장 중요하게 생각합니다.
                  정책 관련 문의는 고객센터로 편하게 문의해 주세요.
                </p>
              </div>
            </details>

            <div className="checkout_agree">
              <label className={`checkout_check ${fieldErrors.policy ? 'checkout_check--error' : ''}`} id="policy">
                <input
                  type="checkbox"
                  checked={agreements.policy}
                  onChange={(e) => {
                    setAgreements(prev => ({ ...prev, policy: e.target.checked }));
                    setFieldErrors(prev => ({ ...prev, policy: false }));
                  }}
                />
                <span>위 정책 및 결제 진행에 동의합니다.</span>
              </label>
              <label className={`checkout_check ${fieldErrors.privacy ? 'checkout_check--error' : ''}`} id="privacy">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) => {
                    setAgreements(prev => ({ ...prev, privacy: e.target.checked }));
                    setFieldErrors(prev => ({ ...prev, privacy: false }));
                  }}
                />
                <span>개인정보 수집·이용 및 제3자 제공에 동의합니다.</span>
              </label>
            </div>
          </section>
        </div>

        {/* 주문 요약 */}
        <aside className="checkout_right" aria-label="주문 요약">
          <div className="checkout_summary">
            <h2 className="checkout_summary__title">주문 요약</h2>

            <div className="checkout_summary__rows">
              <div className="checkout_summary__row">
                <span className="checkout_summary__k">상품금액</span>
                <span className="checkout_summary__v">{Number(goodsTotalChecked).toLocaleString()}원</span>
              </div>
              <div className="checkout_summary__row">
                <span className="checkout_summary__k">배송비</span>
                <span className="checkout_summary__v">{Number(shippingTotalChecked).toLocaleString()}원</span>
              </div>
            </div>

            <div className="checkout_summary__total">
              <span className="checkout_summary__k">총 결제 금액</span>
              <span className="checkout_summary__v checkout_summary__v--big">{Number(grandTotalChecked).toLocaleString()}원</span>
            </div>

            <button
              className="checkout_btn checkout_btn--solid checkout_btn--block"
              type="button"
              onClick={handlePayment}
              disabled={isProcessing || selectedItems.length === 0}
            >
              {isProcessing
                ? "처리 중..."
                : `${Number(grandTotalChecked).toLocaleString()}원 결제하기`
              }
            </button>

            <p className="checkout_summary__note">
              결제하기 버튼을 누르면 {paymentMethod} 결제 화면으로 이동합니다.
            </p>

            <div className="checkout_secure">
              <div className="checkout_secure__item">
                <i className="fa-solid fa-shield-halved"></i>
                <span>보안 결제</span>
              </div>
              <div className="checkout_secure__item">
                <i className="fa-solid fa-box"></i>
                <span>출고 전 검수</span>
              </div>
              <div className="checkout_secure__item">
                <i className="fa-solid fa-truck-fast"></i>
                <span>빠른 출고</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApplyAddress}
      />

    </main>
  );
};

export default Checkout;
