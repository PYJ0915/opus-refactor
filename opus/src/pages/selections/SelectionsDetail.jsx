import { useEffect, useMemo, useState } from "react";
// URL 경로 얻어오기
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading";
import "../../css/Selections-detail.css";
import { useCartStore } from "../../store/useCartStore";
import CartSuccessModal from "./CartSuccessModal";
import { fetchGoodsDetail, fetchGoodsImgList, fetchGoodsOptions } from "../../api/selectionsAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import ScrollToTop from "../../components/common/ScrollToTop";


const SelectionsDetail = () => {

  // url에 적혀있는 상품 번호 얻어옴
  const { goodsNo } = useParams();

  // 문자열 형태로 넘어오기 때문에 숫자로 형변환
  const goodsId = Number(goodsNo);

  // 상품 상세 상태
  const [goodsDetail, setGoodsDetail] = useState(null);

  // 상품 옵션 배열 상태
  const [goodsOptions, setGoodsOptions] = useState([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 상품 이미지 배열
  const [goodsImgList, setGoodsImgList] = useState(null);

  // 사용자가 선택한 색상 상태
  const [selectedColor, setSelectedColor] = useState("");

  // 사용자가 선택한 사이즈 상태
  const [selectedSize, setSelectedSize] = useState("");

  // 사용자가 선택한 수량 상태
  const [qty, setQty] = useState(1);

  // 상세 정보 or 정책 탭
  const [tab, setTab] = useState("info");

  // 장바구니 모달 열림 여부
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // 페이지 이동 훅
  const navigate = useNavigate();

  // 로그인 여부
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // 상품 상세 조회 함수
  const selectGoodsDetail = async () => {

    try {

      console.log("==== 상품 상세 조회 시작 ====");
      const resp = await fetchGoodsDetail(goodsId);

      if (resp.status === 200) {
        console.log("상품 상세 조회 완료", resp.data);
        setGoodsDetail(resp.data);
      }

    } catch (error) {
      console.error("상품 상세 조회 중 예외 발생 : ", error);
    }

  }

  // 상품 옵션 조회 함수
  const selectGoodsOptions = async () => {

    try {

      console.log("==== 상품 옵션 조회 시작 ====");
      const resp = await fetchGoodsOptions(goodsId);

      if (resp.status === 200) {

        console.log("상품 옵션 조회 완료", resp.data);
        setGoodsOptions(resp.data);

      }
    } catch (error) {
      console.error("상품 옵션 조회 중 예외 발생 : ", error);
    }

  };

  // 상품 사진 조회 함수
  const selectGoodsImgList = async () => {

    try {

      console.log("==== 상품 사진 조회 시작 ====");
      const resp = await fetchGoodsImgList(goodsId);

      if (resp.status === 200) {
        console.log("상품 사진 조회 완료", resp.data);
        setGoodsImgList(resp.data)
      }
    } catch (error) {
      console.error("상품 이미지 조회 중 예외 발생 : ", error)
    }
  }

  // 상품 번호가 바뀔 때 마다 상세, 옵션, 사진 재조회
  useEffect(() => {
    selectGoodsDetail();
    selectGoodsOptions();
    selectGoodsImgList();
  }, [goodsId]);

  // 상세, 옵션, 사진 전부 조회 됐을 때 로딩 완료
  useEffect(() => {

    if (goodsDetail != null && goodsImgList != null && goodsOptions != null) setIsLoading(false);

  }, [goodsDetail, goodsImgList, goodsOptions])

  // 상품 상세 정보, 정책 탭 상태 변경 함수
  const handleTab = (tab) => setTab(tab);

  // 수량 상태 변경 함수
  const handleQty = (nextQty) => {

    if ((hasSize || hasColor) && !selectedOptionRow) {
      alert("옵션을 먼저 선택해주세요.");
      return;
    }

    if (nextQty < 1) {
      alert("최소 수량은 1개입니다.");
      return;
    }

    const stock = effectiveOptionRow?.stock;

    if (stock != null && nextQty > stock) {
      alert("선택 가능한 재고 수량을 초과했습니다.");
      return;
    }

    setQty(nextQty);

  }

  // 옵션 존재 여부 (의존성 배열을 통해 상품 옵션이 존재할 때만 계산)
  // 사이즈가 존재하면 true
  const hasSize = useMemo(() => goodsOptions.some((opt) => opt.goodsSize), [goodsOptions]);
  // 색상이 존재하면 true
  const hasColor = useMemo(() => goodsOptions.some((opt) => opt.goodsColor), [goodsOptions]);

  // 사이즈 목록(중복 제거)
  const sizeList = useMemo(() => {

    // 사이즈가 없으면 반환
    if (!hasSize) return [];

    // 옵션 중 사이즈만 뽑아서 저장
    const sizes = goodsOptions.map(option => option.goodsSize);

    // 실제 값이 있는 사이즈만 뽑아서 저장
    const validSizes = sizes.filter(Boolean);

    // 중복 제거
    const uniqueSizes = [...new Set(validSizes)];

    return uniqueSizes;
  }, [goodsOptions, hasSize]);

  // 선택된 사이즈에 해당하는 색상 목록(중복 제거)
  const colorList = useMemo(() => {

    // 색상이 없으면 빈 배열 반환
    if (!hasColor) return [];

    // 사이즈가 존재하는 경우
    if (hasSize) {

      // 사이즈가 존재하는데 선택 하지 않았다면 색상을 보여주지 않음
      if (!selectedSize) return [];

      // 선택된 사이즈에 해당하는 색상만 중복 제거해서 반환
      return [
        ...new Set(
          goodsOptions
            .filter((o) => o.goodsSize === selectedSize)
            .map((o) => o.goodsColor)
            .filter(Boolean)
        ),
      ];
    }

    // 사이즈가 없고 색상만 있으면 전체 색상 중복 제거
    return [...new Set(goodsOptions.map((o) => o.goodsColor).filter(Boolean))];
  }, [goodsOptions, hasColor, hasSize, selectedSize]);

  // 최종 선택된 옵션 행
  const selectedOptionRow = useMemo(() => {

    // 사이즈/색상 둘 다 있는 경우
    if (hasSize && hasColor) {
      if (!selectedSize || !selectedColor) return null;
      return goodsOptions.find(
        (o) => o.goodsSize === selectedSize && o.goodsColor === selectedColor
      );
    }

    // 사이즈만 있는 경우
    if (hasSize && !hasColor) {
      if (!selectedSize) return null;
      return goodsOptions.find((o) => o.goodsSize === selectedSize);
    }

    // 색상만 있는 경우
    if (!hasSize && hasColor) {
      if (!selectedColor) return null;
      return goodsOptions.find((o) => o.goodsColor === selectedColor);
    }

    return null;
  }, [goodsOptions, hasSize, hasColor, selectedSize, selectedColor]);

  // 옵션이 없는 상품일 때(사이즈/색상 모두 없음) 재고 기준이 될 행
  const baseOptionRow = useMemo(() => {
    return goodsOptions?.[0] ?? null; // 1행 있음(둘 다 NULL + stock)
  }, [goodsOptions]);

  // 실제 수량 제한에 사용할 행 (옵션 있으면 selected row, 없으면 base row)
  const effectiveOptionRow = useMemo(() => {
    if (hasSize || hasColor) return selectedOptionRow; // 옵션 상품
    return baseOptionRow; // 옵션 없는 상품
  }, [hasSize, hasColor, selectedOptionRow, baseOptionRow]);

  // 전체 상품 품절 여부
  const isSoldOut = useMemo(() => {
    if (!goodsOptions || goodsOptions.length === 0) return false;
    return goodsOptions.every((opt) => (opt.stock ?? 0) <= 0);
  }, [goodsOptions]);

  // 옵션 변경 시 재고와 선택 수량 비교 (옵션마다 재고가 다르기 때문!)
  useEffect(() => {
    if (!effectiveOptionRow) return;

    // 품절이면 아무것도 하지 않음
    if ((effectiveOptionRow.stock ?? 0) === 0) return;

    if (qty > effectiveOptionRow.stock) {
      alert("재고 이하의 수량만 선택 가능합니다.");
      setQty(1);
    }

  }, [effectiveOptionRow, qty]);

  // 옵션이 변경 시 수량 1로 변경
  useEffect(() => {
    setQty(1);
  }, [selectedOptionRow]);

  // ===== 장바구니 =====

  // 장바구니 상품 추가 함수
  const addItem = useCartStore((state) => state.addItem);

  // 장바구니 비우기 함수
  const clearCart = useCartStore((state) => state.clearCart);

  // 장바구니 추가 핸들러
  const handleAddToCart = () => {
    // 옵션 검증
    if ((hasSize || hasColor) && !selectedOptionRow) {
      alert("옵션을 먼저 선택해주세요.");
      return;
    }

    const row = effectiveOptionRow;
    if (!row) {
      alert("상품 정보를 불러오지 못했습니다.");
      return;
    }

    // 재고 검증
    if (row.stock != null && qty > row.stock) {
      alert("선택 가능한 재고 수량을 초과했습니다.");
      return;
    }

    const goodsSize = hasSize ? selectedOptionRow?.goodsSize ?? null : null;
    const goodsColor = hasColor ? selectedOptionRow?.goodsColor ?? null : null;

    // 옵션 PK가 있으면 그걸로 cartKey를 만드는 게 가장 안전함
    // (없으면 goodsNo + size + color 조합으로)
    const cartKey = row.goodsOptionNo;

    addItem({
      cartKey,
      goodsNo: goodsDetail.goodsNo,
      goodsOptionNo: row.goodsOptionNo ?? null,
      goodsName: goodsDetail.goodsName,
      thumbnail: goodsDetail.goodsThumbnail,
      unitPrice: Number(goodsDetail.goodsPrice),
      deliveryCost: Number(goodsDetail.deliveryCost ?? 0),
      goodsSize,
      goodsColor,
      qty,
      stock: row.stock ?? null,
    });

    setIsCartModalOpen(true);
  };

  // 바로구매 핸들러
  const handleBuyNow = async () => {
    // 옵션 검증
    if ((hasSize || hasColor) && !selectedOptionRow) {
      alert("옵션을 먼저 선택해주세요.");
      return;
    }

    const row = effectiveOptionRow;
    if (!row) {
      alert("상품 정보를 불러오지 못했습니다.");
      return;
    }

    // 재고 검증
    if (row.stock != null && qty > row.stock) {
      alert("선택 가능한 재고 수량을 초과했습니다.");
      return;
    }

    if (!isLoggedIn) {
      alert("상품 구매는 로그인 후 이용 가능힙니다.");
      return;
    }

    const goodsSize = hasSize ? selectedOptionRow?.goodsSize ?? null : null;
    const goodsColor = hasColor ? selectedOptionRow?.goodsColor ?? null : null;

    const cartKey = row.goodsOptionNo;

    // 1. 기존 장바구니 비우기
    await clearCart();
    console.log("==== 바로 구매 중 장바구니 비우기 완료 ====");

    // 2. 현재 상품만 추가
    const result = await addItem({
      cartKey,
      goodsNo: goodsDetail.goodsNo,
      goodsOptionNo: row.goodsOptionNo ?? null,
      goodsName: goodsDetail.goodsName,
      thumbnail: goodsDetail.goodsThumbnail,
      unitPrice: Number(goodsDetail.goodsPrice),
      deliveryCost: Number(goodsDetail.deliveryCost ?? 0),
      goodsSize,
      goodsColor,
      qty,
      stock: row.stock ?? null,
    });

    console.log("addItem 결과", result)

    if (!result?.success) {
      alert("장바구니 추가에 실패했습니다.");
      return;
    }

    await useCartStore.getState().fetchFromServer();

    const newItems = useCartStore.getState().items;
    const latestItem = newItems[0]; // clearCart 했으니 1개뿐

    if (latestItem) {
      useCartStore.getState().checkItem(latestItem.cartKey);
    }

    // 4. 결제 페이지로 이동
    navigate("/selections/checkout");
  };

  return (
    isLoading ? (
      <div className="loading-box">
        <Loading />
        <p className="loading_msg">상품 상세정보를 로딩 중입니다.</p>
      </div>
    ) : (
      <main className="container">
        <section className="top-grid">
          <div id="product-images" className="gallery">
            <div className="gallery__main">
              <img
                id="mainImage"
                className="gallery__main-img"
                src={`${import.meta.env.VITE_API_URL}${goodsDetail.goodsThumbnail}`}
                alt={goodsDetail.goodsName}
              />
            </div>
          </div>

          <div id="product-info" className="goods_info">
            <div className="info__head">
              <h1 className="title">{goodsDetail.goodsName}</h1>
            </div>

            <div className="price-box">
              <div className="price-row">
                <span className="label label--strong">상품 가격</span>
                <span className="value value--big" id="unitPriceText">{Number(goodsDetail.goodsPrice).toLocaleString()}원</span>
              </div>
              <div className="price-row">
                <span className="label">배송비</span>
                <span className="value">{goodsDetail.deliveryCost == 0 ? "무료" : (Number(goodsDetail.deliveryCost).toLocaleString()) + '원'}</span>
              </div>
            </div>


            <div id="product-options" className="options">
              {/* 사이즈 선택: 중복 제거된 sizeList로 출력 */}
              {hasSize && (
                <div className="field">
                  <label className="field__label">사이즈 / 수량</label>
                  <div className="select-wrap">
                    <select
                      className="option_select"
                      value={selectedSize}
                      onChange={(e) => {
                        setSelectedSize(e.target.value);
                        setSelectedColor(""); // 사이즈 바뀌면 색상 초기화
                      }}
                    >
                      <option value="">사이즈/수량 선택</option>
                      {sizeList.map((s) => {
                        const hasStock = goodsOptions.some(
                          (o) => o.goodsSize === s && (o.stock ?? 0) > 0
                        );

                        return (
                          <option
                            key={s}
                            value={s}
                            disabled={!hasStock}
                          >
                            {s} {!hasStock && "(품절)"}
                          </option>
                        );
                      })}
                    </select>
                    <i className="fa-solid fa-chevron-down select__icon" aria-hidden="true"></i>
                  </div>
                </div>
              )}

              {/* 색상 선택: size 선택 후 colorList 출력 */}
              {hasColor && (
                <div className="field">
                  <label className="field__label">색상 / 타입</label>
                  <div className="select-wrap">
                    <select
                      className="option_select"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      disabled={hasSize && !selectedSize} // 사이즈가 있으면 사이즈 먼저 선택
                    >
                      <option value="">색상/타입 선택</option>
                      {colorList.map((c) => {
                        const hasStock = goodsOptions.some(
                          (o) =>
                            (!hasSize || o.goodsSize === selectedSize) &&
                            o.goodsColor === c &&
                            (o.stock ?? 0) > 0
                        );

                        return (
                          <option
                            key={c}
                            value={c}
                            disabled={!hasStock}
                          >
                            {c} {!hasStock && "(품절)"}
                          </option>
                        );
                      })}
                    </select>
                    <i className="fa-solid fa-chevron-down select__icon" aria-hidden="true"></i>
                  </div>
                </div>
              )}

            </div>

            {/* 선택 박스: 옵션 row가 확정되면 표시 */}
            {(selectedOptionRow || (!hasSize && !hasColor && effectiveOptionRow)) && (
              <div className="field selected-field">

                {effectiveOptionRow?.stock === 0 && (
                  <div className="soldout-message">
                    해당 옵션은 품절입니다.
                  </div>
                )}

                {/* 옵션 있는 경우 */}
                {selectedOptionRow && (
                  <div className="selected-box">
                    선택된 옵션:
                    {hasSize ? ` ${selectedOptionRow.goodsSize}` : ""}
                    {hasColor ? ` / ${selectedOptionRow.goodsColor}` : ""}
                    {` (재고: ${selectedOptionRow.stock})`}
                  </div>
                )}

                {/* 옵션 없는 경우 */}
                {!hasSize && !hasColor && effectiveOptionRow && (
                  <div className="selected-box">
                    재고: {effectiveOptionRow.stock}
                  </div>
                )}

                <label className="field__label">수량</label>
                <div className="qty">
                  <button className="qty__btn" type="button" disabled={isSoldOut} id="qtyMinus" aria-label="minus" onClick={() => handleQty(qty - 1)}>
                    <i className="fa-solid fa-minus" aria-hidden="true"></i>
                  </button>

                  <input className="qty_input" type="number" id="qtyInput" value={qty} readOnly />

                  <button className="qty__btn" type="button" disabled={isSoldOut} id="qtyPlus" aria-label="plus" onClick={() => handleQty(qty + 1)}>
                    <i className="fa-solid fa-plus" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            )}

            <div id="product-total" className="total">
              <div className="total__row">
                <span className="label">총 상품금액</span>
                <span className="total__price" id="totalPriceText">{Number(goodsDetail.goodsPrice * qty).toLocaleString()}원</span>
              </div>
            </div>

            <div id="product-actions" className="actions">

              {(isSoldOut || effectiveOptionRow?.stock === 0) ? (

                <button
                  className="goods_btn goods_btn--soldout"
                  type="button"
                  disabled
                >
                  품절
                </button>

              ) : (

                <>
                  <button
                    className="goods_btn goods_btn--outline"
                    type="button"
                    onClick={handleAddToCart}
                  >
                    장바구니
                  </button>

                  <button
                    className="goods_btn goods_btn--solid"
                    type="button"
                    onClick={handleBuyNow}
                  >
                    바로 구매
                  </button>
                </>

              )}

            </div>

            <div id="product-seller-info" className="seller">
              <div className="seller__row">
                <span className="seller__label">판매자</span>
                <span className="seller__value seller__value--strong">{goodsDetail.goodsSeller}</span>
              </div>
              <div className="seller__row">
                <span className="seller__label">배송</span>
                <span className="seller__value">평균 2-3일 소요</span>
              </div>
            </div>
          </div>
        </section>


        <section id="product-detail-tabs" className="goods_tabs">
          <div className="tabs_bar">
            <button className={`goods_tab ${tab === "info" ? "is-active" : ""}`}
              type="button" data-tab="detail" onClick={() => handleTab("info")}>상세정보</button>
            <button className={`goods_tab ${tab === "policy" ? "is-active" : ""}`}
              type="button" data-tab="shipping" onClick={() => handleTab("policy")}>배송/교환/반품</button>
          </div>

          <div className="tabs_content">

            <div className={`goods_tab-panel ${tab == "info" ? "is-active" : ""}`} id="tab-detail">
              <div className="detail-wrap">
                <h2 className="section-title">상품 상세정보</h2>

                <div className="prose">
                  <pre>
                    {goodsDetail.goodsInfo}
                  </pre>

                  <div>
                    {goodsImgList?.map((img) => (
                      <div className="detail-image" key={img.goodsImgNo}>
                        <img src={`${import.meta.env.VITE_API_URL}${img.goodsImgFullpath}`} />
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            <div className={`goods_tab-panel ${tab == "policy" ? "is-active" : ""}`} id="tab-shipping">
              <div className="detail-wrap">
                {/*  OPUS 배송/교환/반품 정책 (Copy & Paste) */}
                <header className="policy__header">
                  <h2 className="policy__title">배송/교환/반품 정책</h2>
                  <p className="policy__subtitle">OPUS는 세련된 경험과 신뢰 가능한 운영 기준을 함께 제공합니다.</p>
                </header>
                <section className="policy policy--opus" aria-label="OPUS 배송/교환/반품 정책">
                  <article className="policy__section" id="shipping">
                    <h3 className="policy__section-title">배송 안내</h3>
                    <p className="policy__text">
                      OPUS는 주문 확인 후, 상품의 품질을 한 번 더 점검한 뒤 출고됩니다.
                    </p>

                    <ul className="policy__list">
                      <li><strong>배송 방법</strong>: 택배 배송</li>
                      <li><strong>배송 지역</strong>: 대한민국 전 지역</li>
                      <li>
                        <strong>배송 비용</strong>:
                        <ul className="policy__sublist">
                          <li>기본 배송비 3,000원</li>
                          <li>일정 금액 이상 구매 시 무료 배송 (상세 기준은 결제 페이지 참고)</li>
                        </ul>
                      </li>
                      <li>
                        <strong>배송 기간</strong>:
                        <ul className="policy__sublist">
                          <li>결제 완료 후 영업일 기준 1–3일 이내 출고</li>
                          <li>출고 후 배송까지는 지역에 따라 1–2일 정도 소요될 수 있습니다.</li>
                        </ul>
                      </li>
                    </ul>

                    <p className="policy__note">
                      ※ 주문 폭주, 제작 일정, 택배사 사정에 따라 배송이 지연될 수 있으며, 지연이 발생할 경우 개별 안내드립니다.
                    </p>
                  </article>

                  <article className="policy__section" id="exchange-return">
                    <h3 className="policy__section-title">교환 및 반품 안내</h3>
                    <p className="policy__text">
                      OPUS는 고객님의 만족스러운 쇼핑 경험을 위해 아래와 같은 기준으로 교환·반품을 운영합니다.
                    </p>

                    <div className="policy__grid">
                      <section className="policy__card" aria-label="교환·반품 가능">
                        <h4 className="policy__card-title">교환·반품이 가능한 경우</h4>
                        <ul className="policy__list">
                          <li>상품 수령일로부터 <strong>7일 이내</strong> 교환·반품 요청 시</li>
                          <li>상품의 <strong>착용 흔적, 사용 흔적, 훼손</strong>이 없는 경우</li>
                          <li>구성품(케이스, 포장재, 사은품 등)이 모두 보존된 상태</li>
                        </ul>
                      </section>

                      <section className="policy__card" aria-label="교환·반품 불가">
                        <h4 className="policy__card-title">교환·반품이 불가능한 경우</h4>
                        <ul className="policy__list">
                          <li>고객님의 부주의로 상품이 훼손되거나 가치가 감소한 경우</li>
                          <li>착용 또는 사용 흔적이 확인되는 경우</li>
                          <li>상품 수령 후 7일이 경과한 경우</li>
                          <li>주문 제작 상품 또는 별도 안내된 교환·반품 불가 상품</li>
                        </ul>
                      </section>
                    </div>
                  </article>

                  <article className="policy__section" id="fees">
                    <h3 className="policy__section-title">교환·반품 배송비 안내</h3>

                    <ul className="policy__list">
                      <li>
                        <strong>단순 변심</strong>에 의한 교환·반품:
                        <span>왕복 배송비 고객 부담</span>
                      </li>
                      <li>
                        <strong>상품 불량 또는 오배송</strong>의 경우:
                        <span>배송비 전액 OPUS 부담</span>
                      </li>
                    </ul>

                    <p className="policy__note">
                      ※ 반품 배송비는 최초 배송비 결제 여부에 따라 차감 또는 별도 입금 안내될 수 있습니다.
                    </p>
                  </article>

                  <article className="policy__section" id="process">
                    <h3 className="policy__section-title">교환·반품 절차</h3>

                    <ol className="policy__steps">
                      <li>고객센터 또는 마이페이지를 통해 교환·반품 신청</li>
                      <li>안내에 따라 상품 회수 진행</li>
                      <li>상품 상태 확인 후 교환 또는 환불 처리</li>
                    </ol>

                    <p className="policy__note">
                      ※ 사전 접수 없이 임의로 반송하신 경우 처리가 지연될 수 있습니다.
                    </p>
                  </article>

                  <article className="policy__section" id="refund">
                    <h3 className="policy__section-title">환불 안내</h3>

                    <ul className="policy__list">
                      <li>반품 상품이 OPUS에 도착하여 검수 완료 후 <strong>영업일 기준 3–5일 이내</strong> 환불이 진행됩니다.</li>
                      <li>카드사 및 결제 수단에 따라 실제 환불 시점은 다소 차이가 있을 수 있습니다.</li>
                    </ul>
                  </article>

                  <footer className="policy__footer">
                    <h3 className="policy__section-title">안내사항</h3>
                    <p className="policy__text">
                      OPUS는 모든 상품을 출고 전 꼼꼼하게 검수하고 있으며, 고객님께 전달되는 순간까지 품질을 가장 중요하게 생각합니다.<br />
                      정책 관련 문의는 언제든 고객센터를 통해 편하게 문의해 주세요.
                    </p>
                  </footer>
                </section>
              </div>
            </div>
          </div>
        </section>

        <ScrollToTop />

        <CartSuccessModal
          isOpen={isCartModalOpen}
          goods={goodsDetail}
          qty={qty}
          selectedOption={selectedOptionRow}
          onClose={() => setIsCartModalOpen(false)}
          onContinue={() => setIsCartModalOpen(false)}
          onGoCart={() => navigate("/selections/cart")}
        />

      </main>
    )
  )
}

export default SelectionsDetail;