import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { unveilingData } from "../data/unveilingData";
import "../css/UnveilingDetail.css";
import { useAuthStore } from "../components/auth/useAuthStore";
import axiosApi from "../api/axiosAPI";
import axios from "axios";

const pad2 = (n) => String(n).padStart(2, "0");

function getRemaining(endAt) {
  const end = endAt ? new Date(endAt) : null;
  if (!end || Number.isNaN(end.getTime())) {
    return { done: false, days: "00", hours: "00", minutes: "00", seconds: "00" };
  }

  const now = new Date();
  const diff = end - now;

  if (diff <= 0) {
    return { done: true, days: "00", hours: "00", minutes: "00", seconds: "00" };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { done: false, days: pad2(days), hours: pad2(hours), minutes: pad2(minutes), seconds: pad2(seconds) };
}

const STATUS = {
  LIVE: { text: "진행중", key: "live" },
  UPCOMING: { text: "예정", key: "soon" },
  ENDED: { text: "종료", key: "ended" },
};

function normalizeFromDummy(item) {
  return {
    unveilingNo: item.id,
    image: item.image,
    alt: item.alt || "auction item image",
    status: item.status ?? "LIVE",
    title: item.detailTitle ?? item.title ?? "무제 (Untitled)",
    artist: item.artist ? `${item.artist} 작가` : "작가 정보",
    year: item.year ?? "",
    material: item.material ?? "",
    size: item.size ?? "",
    estimate: item.estimate ?? "",
    startPrice: item.startPrice ?? "",
    currentPrice: item.currentPrice ?? item.pricing?.display ?? "",
    bidCount: item.bidCount ?? item.stats?.count ?? 0,
    endAt: item.endAt ?? null,
    endAtLabel: item.endAtLabel ?? "",
    description: item.description ?? [],
    artistName: item.artistName ?? (item.artist ?? ""),
    artistBio: item.artistBio ?? "",
    exhibitions: item.exhibitions ?? "",
    awards: item.awards ?? "",
  };
}

function normalizeFromApi(data, fallbackUnveilingNo, fallbackDetail) {
  const formatKRW = (n) => `₩${Number(n).toLocaleString("ko-KR")}`;

  const toISODateTime = (v) => {
    if (!v) return null;
    if (typeof v === "string") {
      const s = v.trim();
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return s.replace(" ", "T");
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00`;
      return s;
    }
    return String(v);
  };

  const serverImg =
    data?.thumbUrl ??
    data?.imageUrl ??
    data?.image ??
    null;

  return {
    unveilingNo: data?.unveilingNo ?? fallbackUnveilingNo,
    image: serverImg ?? fallbackDetail?.image ?? "",
    alt: fallbackDetail?.alt ?? "auction item image",
    status: data?.unveilingStatus ?? fallbackDetail?.status ?? "LIVE",
    title: data?.unveilingTitle ?? fallbackDetail?.title ?? "무제 (Untitled)",
    artist: data?.productionArtist
      ? `${data.productionArtist} 작가`
      : (fallbackDetail?.artist ?? "작가 정보"),
    year: data?.productionYear ?? fallbackDetail?.year ?? "",
    material: data?.productionMaterial ?? fallbackDetail?.material ?? "",
    size: data?.productionSize ?? fallbackDetail?.size ?? "",
    estimate: fallbackDetail?.estimate ?? "",
    startPrice:
      typeof data?.startPrice === "number"
        ? formatKRW(data.startPrice)
        : (fallbackDetail?.startPrice ?? ""),
    currentPrice:
      typeof data?.currentPrice === "number"
        ? formatKRW(data.currentPrice)
        : (fallbackDetail?.currentPrice ?? ""),
    bidCount:
      typeof data?.biddingCount === "number"
        ? data.biddingCount
        : (fallbackDetail?.bidCount ?? 0),
    endAt: toISODateTime(data?.finishDate ?? fallbackDetail?.endAt ?? null),
    endAtLabel: fallbackDetail?.endAtLabel ?? "",
    description: data?.productionDetail ?? fallbackDetail?.description ?? [],
    artistName: data?.productionArtist ?? fallbackDetail?.artistName ?? "",
    artistBio: data?.artistDetail ?? fallbackDetail?.artistBio ?? "",
    exhibitions: fallbackDetail?.exhibitions ?? "",
    awards: fallbackDetail?.awards ?? "",
  };
}

export default function UnveilingDetail() {
  const { id } = useParams();
  const unveilingNo = useMemo(() => Number(id), [id]);

  const dummyItem = useMemo(() => {
    if (!Number.isFinite(unveilingNo)) return null;
    return unveilingData.find((v) => v.id === unveilingNo) ?? null;
  }, [unveilingNo]);

  const dummyDetail = useMemo(() => {
    if (dummyItem) return normalizeFromDummy(dummyItem);
    return {
      unveilingNo,
      image: "",
      alt: "auction item image",
      status: "LIVE",
      title: "경매 상세",
      artist: "",
      year: "",
      material: "",
      size: "",
      estimate: "",
      startPrice: "",
      currentPrice: "",
      bidCount: 0,
      endAt: null,
      endAtLabel: "",
      description: [],
      artistName: "",
      artistBio: "",
      exhibitions: "",
      awards: "",
    };
  }, [dummyItem, unveilingNo]);

  // ===== State =====
  const [detail, setDetail] = useState(dummyDetail);
  const [bidState, setBidState] = useState(null);
  const [showTop, setShowTop] = useState(false);

  // 응찰 모달
  const [modal, setModal] = useState(false);
  const [modalPw, setModalPw] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [isSocialLogin, setIsSocialLogin] = useState(false);

  // 결제 모달
  const [payModal, setPayModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  // 라우트 이동 시 리셋
  useEffect(() => {
    setDetail(dummyDetail);
    setBidState(null);
    setShowTop(false);
  }, [dummyDetail]);

  // Top 버튼 스크롤 감지
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ===== API 호출 =====
  const fetchDetail = useCallback(async () => {
    try {
      const { data } = await axiosApi.get(`/api/unveilings/${unveilingNo}`);
      setDetail((prev) => normalizeFromApi(data, unveilingNo, prev));
    } catch {
      // noop
    }
  }, [unveilingNo]);

  const fetchBidState = useCallback(async () => {
    try {
      const { data } = await axiosApi.get(`/api/unveilings/${unveilingNo}/bid-state`);
      setBidState(data);

      if (data?.unveilingStatus) {
        setDetail((prev) => ({ ...prev, status: data.unveilingStatus }));
      }

      if (typeof data?.currentPrice === "number") {
        setDetail((prev) => ({
          ...prev,
          currentPrice: `₩${Number(data.currentPrice).toLocaleString("ko-KR")}`,
          bidCount: typeof data?.biddingCount === "number" ? data.biddingCount : prev.bidCount,
        }));
      }
    } catch (e) {
      console.error("fetchBidState 에러:", e);
    }
  }, [unveilingNo]);

  // interval은 분리
  useEffect(() => {
    if (!Number.isFinite(unveilingNo) || unveilingNo <= 0) return;
    fetchDetail();
    fetchBidState();
  }, [fetchDetail, fetchBidState, unveilingNo]);

  // 폴링은 별도 useEffect로 분리
  useEffect(() => {
    if (!Number.isFinite(unveilingNo) || unveilingNo <= 0) return;
    if (bidState?.unveilingStatus === "ENDED") return; // 종료된 경매는 폴링 중단

    const interval = setInterval(fetchBidState, 10000);
    return () => clearInterval(interval);
  }, [fetchBidState, unveilingNo, bidState?.unveilingStatus]);

  // 카운트다운 (1초 간격)
  const [remain, setRemain] = useState(() => getRemaining(detail.endAt));
  useEffect(() => {
    const tick = () => setRemain(getRemaining(detail.endAt));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [detail.endAt]);

  // ===== 상태 판단 =====
  const serverStatus = bidState?.unveilingStatus || detail.status;
  const status = STATUS[serverStatus] ?? STATUS.LIVE;
  const { isLoggedIn, member } = useAuthStore();

  // LIVE 상태일 때만 본인 최고가 표시
  const isTopBidder = serverStatus === "LIVE"
    && bidState?.topBidderMemberNo > 0
    && member?.memberNo === bidState?.topBidderMemberNo;

  // 낙찰 관련 상태 판단
  const isWinner = bidState?.finalizedFl === 1
    && member?.memberNo === bidState?.winnerMemberNo;
  const paymentStatus = bidState?.paymentStatus ?? null;
  const isNoWinner = bidState?.paymentStatus === "NO_WINNER";

  const bidAllowed = bidState ? !!bidState.bidAllowedFl : true;
  const bidDisabled = bidState ? (!bidAllowed || isTopBidder) : false;
  const bidDisabledReason = isTopBidder
    ? "본인이 최고가 입찰자입니다."
    : (bidState?.reason || (remain.done ? "마감됨" : "응찰 불가"));

  const statusClass = `status status--${status.key}`;
  const timerClass = `timer timer--${status.key}${!bidAllowed ? " is-ended" : ""}`;
  const bidBtnClass = `bid-btn${bidDisabled ? " is-ended" : ""}`;

  // ===== 핸들러 =====

  // 응찰 버튼 클릭 → 모달 오픈
  const onBid = useCallback(() => {
    if (!isLoggedIn) {
      alert("로그인 후 응찰할 수 있습니다.");
      return;
    }
    if (bidState && !bidState.bidAllowedFl) {
      alert(bidState.reason || "현재 응찰할 수 없습니다.");
      return;
    }

    const social = member?.loginType !== "NORMAL";
    setIsSocialLogin(social);

    const minutesLeft = detail.endAt
      ? (new Date(detail.endAt) - new Date()) / 1000 / 60
      : Infinity;
    setIsUrgent(minutesLeft <= 1);
    
    setModalPw("");
    setModalError("");
    setModal(true);
  }, [isLoggedIn, bidState, member, detail.endAt]);

  // 응찰 모달 확인 클릭 → 비밀번호 검증 후 입찰
  const onBidConfirm = useCallback(async () => {
    if (!isSocialLogin && !modalPw) {
      setModalError("비밀번호를 입력해주세요.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      // 일반 로그인만 비밀번호 검증 (소셜 로그인은 Oauth를 통해 본인인증이 된 셈)
      if (!isSocialLogin) {
        await axiosApi.post("/auth/verify-password",
          { memberPw: modalPw },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
            withCredentials: true,
          }
        );
      }

      const { data } = await axiosApi.post(`/api/bids/${unveilingNo}`, {});

      setDetail((prev) => ({
        ...prev,
        currentPrice: `₩${Number(data.currentPrice).toLocaleString("ko-KR")}`,
        bidCount: data.biddingCount,
        status: data.unveilingStatus,
      }));

      await fetchBidState();
      setModal(false);
      alert("응찰이 완료되었습니다.");

    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data || "오류가 발생했습니다.";

      if (status === 401) {
        setModalError("비밀번호가 일치하지 않습니다.");
      } else {
        setModalError(`응찰 실패: ${msg}`);
      }
    } finally {
      setModalLoading(false);
    }
  }, [isSocialLogin, modalPw, unveilingNo, fetchBidState]);

  // 결제하기 버튼 클릭 → 결제 모달 오픈
  const onPay = useCallback(() => {
    setPayModal(true);
  }, []);

  // 결제 모달 확인 클릭 → 실제 결제 처리
  const onPayConfirm = useCallback(async () => {
    setPayLoading(true);
    try {
      const { data } = await axiosApi.post(`/api/unveilings/${unveilingNo}/pay`);
      setPayModal(false);
      alert(data.message || "결제가 완료되었습니다.");
      await fetchBidState();
    } catch (err) {
      const msg = err?.response?.data?.message || "결제 중 오류가 발생했습니다.";
      setPayModal(false);
      alert(msg);
    } finally {
      setPayLoading(false);
    }
  }, [unveilingNo, fetchBidState]);

  // ===== 잘못된 id 처리 =====
  if (!Number.isFinite(unveilingNo) || unveilingNo <= 0) {
    return (
      <div className="page unveiling-detail">
        <main className="container">
          <div className="back-row">
            <Link to="/unveiling" className="back-link">
              <i className="fa-solid fa-chevron-left" />
              <span>경매 목록으로 돌아가기</span>
            </Link>
          </div>
          <p>올바르지 않은 경매 번호입니다.</p>
        </main>
      </div>
    );
  }

  // ===== 렌더링 =====
  return (
    <div className="page unveiling-detail">
      <main className="container">
        <div className="back-row">
          <Link to="/unveiling" className="back-link">
            <i className="fa-solid fa-chevron-left" />
            <span>경매 목록으로 돌아가기</span>
          </Link>
        </div>

        <section id="auction-detail-section" className="detail">
          <div id="image-section" className="image">
            <div className="image__main">
              {detail.image ? (
                <img id="mainImage" src={detail.image} alt={detail.alt} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "4/3" }} />
              )}
            </div>
          </div>

          <div id="info-section" className="info">
            <div className="info__top">
              <span className={statusClass}>{status.text}</span>
              <h1 className="title">{detail.title}</h1>
              <p className="artist">{detail.artist}</p>

              <div className="spec">
                <div className="spec__row">
                  <span className="spec__k">제작연도</span>
                  <span className="spec__v">{detail.year}</span>
                </div>
                <div className="spec__row">
                  <span className="spec__k">재료</span>
                  <span className="spec__v">{detail.material}</span>
                </div>
                <div className="spec__row">
                  <span className="spec__k">크기</span>
                  <span className="spec__v">{detail.size}</span>
                </div>
              </div>
            </div>

            <div className="pricebox">
              <div className="pricebox__block">
                <p className="pricebox__label">추정가</p>
                <p className="pricebox__value pricebox__value--lg">{detail.estimate}</p>
              </div>
              <div className="pricebox__block pricebox__divider">
                <p className="pricebox__label">시작가</p>
                <p className="pricebox__value">{detail.startPrice}</p>
              </div>
              <div className="pricebox__block pricebox__divider">
                <p className="pricebox__label">현재가</p>
                <p className="pricebox__value pricebox__value--xl">{detail.currentPrice}</p>
                <p className="pricebox__hint">응찰 {detail.bidCount}회</p>
                {bidState && bidState.bidAllowedFl && typeof bidState.nextBidPrice === "number" && (
                  <p className="pricebox__hint">
                    다음 자동 입찰가: ₩{Number(bidState.nextBidPrice).toLocaleString("ko-KR")}
                    {" "}(호가: ₩{Number(bidState.tick).toLocaleString("ko-KR")})
                  </p>
                )}
              </div>
            </div>

            <div className={timerClass}>
              <div className="timer__row">
                <span className="timer__label">마감까지</span>
                <div className="countdown" aria-label="countdown">
                  <div className="countdown__unit">
                    <span>{remain.days}</span>
                    <span className="countdown__txt">일</span>
                  </div>
                  <span className="countdown__sep">:</span>
                  <div className="countdown__unit">
                    <span>{remain.hours}</span>
                    <span className="countdown__txt">시간</span>
                  </div>
                  <span className="countdown__sep">:</span>
                  <div className="countdown__unit">
                    <span>{remain.minutes}</span>
                    <span className="countdown__txt">분</span>
                  </div>
                  <span className="countdown__sep">:</span>
                  <div className="countdown__unit">
                    <span>{remain.seconds}</span>
                    <span className="countdown__txt">초</span>
                  </div>
                </div>
              </div>
              <p className="timer__hint">{detail.endAtLabel}</p>
            </div>

            {/* 응찰 버튼 */}
            <button
              className={bidBtnClass}
              type="button"
              disabled={bidDisabled}
              onClick={onBid}
              title={bidDisabled ? bidDisabledReason : undefined}
            >
              {bidDisabled
                ? (isTopBidder ? "본인 최고가" : (bidState?.reason || "마감됨"))
                : "응찰하기"}
            </button>

            {/* 낙찰 후 결제 UI */}
            {bidState?.finalizedFl === 1 && (
              <div className="payment-box">
                {isNoWinner ? (
                  <button className="bid-btn is-ended" type="button" disabled>
                    유찰된 경매입니다
                  </button>
                ) : isWinner && (
                  <>
                    <p className="payment-box__label">
                      🎉 낙찰을 축하드립니다!
                      낙찰가: <strong>₩{Number(bidState?.finalPrice ?? bidState?.currentPrice).toLocaleString("ko-KR")}</strong>
                    </p>
                    {paymentStatus === "PENDING" && (
                      <button className="bid-btn" type="button" disabled={payLoading} onClick={onPay}>
                        {payLoading ? "처리 중..." : "결제 신청"}
                      </button>
                    )}
                    {paymentStatus === "PAID" && (
                      <button className="bid-btn is-ended" type="button" disabled>
                        결제 신청 완료
                      </button>
                    )}
                    {paymentStatus === "EXPIRED" && (
                      <button className="bid-btn is-ended" type="button" disabled>
                        결제 기한 만료
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="notice">
              <div className="notice__row">
                <i className="fa-solid fa-circle-info"></i>
                <p>
                  응찰을 위해서는 본인 인증이 필요합니다.
                  <br />
                  경매 참여 전 회원정보에서 실명 인증을 완료해주세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="description-section" className="section">
          <h2 className="section__title">작품 설명</h2>
          <div className="prose">
            {(Array.isArray(detail.description) ? detail.description : [detail.description]).map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>

        <section id="artist-section" className="section">
          <h2 className="section__title">작가 소개</h2>
          <div className="artist-box">
            <div className="artist-box__info">
              <h3 className="artist-box__name">{detail.artistName}</h3>
              <p className="artist-box__desc">{detail.artistBio}</p>
              <div className="artist-box__meta">
                <p><strong>주요 전시:</strong> {detail.exhibitions}</p>
                <p><strong>수상:</strong> {detail.awards}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="bidding-guide-section" className="section">
          <h2 className="section__title">응찰 안내</h2>
          <div className="guide-grid">
            <div>
              <h3 className="sub-title">호가표</h3>
              <div className="tick-table">
                <div className="tick-table__head">
                  <div>현재가</div>
                  <div>응찰 단위</div>
                </div>
                <div className="tick-table__row">
                  <div>500만원 미만</div>
                  <div>10만원</div>
                </div>
                <div className="tick-table__row">
                  <div>500만원 ~ 1,000만원</div>
                  <div>50만원</div>
                </div>
                <div className="tick-table__row">
                  <div>1,000만원 ~ 3,000만원</div>
                  <div>100만원</div>
                </div>
                <div className="tick-table__row">
                  <div>3,000만원 ~ 5,000만원</div>
                  <div>200만원</div>
                </div>
                <div className="tick-table__row">
                  <div>5,000만원 이상</div>
                  <div>500만원</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="sub-title">응찰 필수 정보</h3>
              <div className="bullets">
                <Bullet text="경매 참여를 위해서는 실명 인증이 필수입니다." />
                <Bullet text="응찰 후 취소는 불가능하며, 낙찰 시 구매 의무가 발생합니다." />
                <Bullet text="낙찰가 외에 구매 수수료(낙찰가의 15%)가 별도로 부과됩니다." />
                <Bullet text="마감 1분 전 응찰 시 자동으로 1분 연장됩니다." />
                <Bullet text="결제는 낙찰 후 7일 이내에 완료되어야 합니다." />
                <Bullet text="작품 배송은 결제 완료 후 3-5 영업일 소요됩니다." />
              </div>
            </div>
          </div>

          <div className="caution">
            <h3 className="sub-title">유의사항</h3>
            <div className="caution__list">
              <p>• 작품의 상태는 상세 이미지를 통해 확인하실 수 있으며, 추가 문의는 고객센터로 연락 주시기 바랍니다.</p>
              <p>• 경매 마감 후 최고가 응찰자가 낙찰자로 결정되며, 낙찰 확정 메일이 발송됩니다.</p>
              <p>• 작품 인수는 직접 방문 또는 배송 중 선택 가능합니다.</p>
              <p>• 설치 및 보관 비용과 배송비는 공지사항 참고 바랍니다.</p>
              <p>• 모든 작품은 진품 보증서와 함께 제공됩니다.</p>
            </div>
          </div>
        </section>

        <section id="service-info-section" className="section">
          <h2 className="section__title">경매 이용 안내</h2>
          <div className="service-info">
            <div className="service-info__item">
              <h3 className="service-info__title">낙찰 수수료</h3>
              <p className="service-info__desc">
                낙찰가의 <strong>15%</strong>가 구매 수수료로 별도 부과됩니다.
                수수료는 부가세가 포함된 금액이며, 낙찰 확정 후 최종 결제 금액에 합산됩니다.
              </p>
            </div>
            <div className="service-info__item">
              <h3 className="service-info__title">출고 및 수령</h3>
              <p className="service-info__desc">
                작품 인도는 <strong>직접 출고(대면 수령)</strong>를 원칙으로 진행됩니다.
              </p>
              <ul className="service-info__list">
                <li>출고 가능 요일: 매주 월요일 ~ 금요일</li>
                <li>직접 수령 가능 시간: 10:00 ~ 18:00</li>
                <li>출고 요청 마감: 출고 요청일 기준 2일 전까지 접수</li>
              </ul>
              <p className="service-info__desc">
                낙찰자 승용차로 작품 상차 시, 작품 전체 크기 90 × 118cm까지 적재가 가능합니다
                (캔버스 50호 기준).
              </p>
              <p className="service-info__desc">
                부득이하게 배송, 설치 또는 보관이 필요한 경우에는
                낙찰 확정 후 고객센터를 통해 별도 문의가 가능합니다.
              </p>
            </div>
            <div className="service-info__item">
              <h3 className="service-info__title">설치 및 보관</h3>
              <p className="service-info__desc">
                설치 서비스 또는 장기 보관이 필요한 경우,
                낙찰 후 고객센터를 통해 별도 문의가 가능합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 응찰 확인 모달 */}
        {modal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
          }}>
            <div style={{
              background: "#fff", borderRadius: "12px",
              padding: "36px 32px", width: "100%", maxWidth: "400px",
              display: "flex", flexDirection: "column", gap: "16px"
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 900 }}>응찰 확인</h2>
              <p style={{ margin: 0, color: "#374151", fontSize: "14px", lineHeight: 1.7 }}>
                응찰 금액:{" "}
                <strong>₩{Number(bidState?.nextBidPrice).toLocaleString("ko-KR")}</strong>
                <br />
                응찰 후에는 취소가 불가능하며, 낙찰 시 구매 의무가 발생합니다.
              </p>

              {isUrgent && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#991b1b",
                  lineHeight: 1.7,
                  marginTop: "4px"
                }}>
                  ⏰ <strong>마감 1분 이내</strong>입니다.<br />
                  응찰 완료 시 마감 시간이 <strong>1분 연장</strong>됩니다.
                </div>
              )}

              {/* 핵심 분기: 일반 로그인 → 비밀번호 입력 / 소셜 로그인 → 안내 문구 */}
              {!isSocialLogin ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700 }}>비밀번호 확인</label>
                  <input
                    type="password"
                    value={modalPw}
                    onChange={(e) => setModalPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onBidConfirm()}
                    placeholder="비밀번호를 입력해주세요"
                    style={{
                      padding: "10px 14px", border: "1px solid #d1d5db",
                      borderRadius: "8px", fontSize: "14px", outline: "none"
                    }}
                  />
                  {modalError && (
                    <p style={{ margin: 0, color: "#dc2626", fontSize: "13px" }}>{modalError}</p>
                  )}
                </div>
              ) : (
                <div style={{
                  background: "#fffbeb", border: "1px solid #fde68a",
                  borderRadius: "8px", padding: "14px 16px",
                  fontSize: "13px", color: "#92400e", lineHeight: 1.7
                }}>
                  ⚠ 소셜 로그인(Google) 계정으로 응찰합니다.
                  <br />
                  확인 버튼을 누르면 즉시 응찰이 진행되며, <strong>되돌릴 수 없습니다.</strong>
                  {modalError && (
                    <p style={{ margin: "8px 0 0", color: "#dc2626", fontSize: "13px" }}>{modalError}</p>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setModal(false)}
                  style={{
                    flex: 1, height: "44px", border: "1px solid #d1d5db",
                    borderRadius: "8px", background: "#fff",
                    fontWeight: 700, cursor: "pointer"
                  }}
                >
                  취소
                </button>
                <button
                  onClick={onBidConfirm}
                  disabled={modalLoading}
                  style={{
                    flex: 1, height: "44px", border: 0,
                    borderRadius: "8px", background: "#111827",
                    color: "#fff", fontWeight: 800,
                    cursor: modalLoading ? "not-allowed" : "pointer",
                    opacity: modalLoading ? 0.7 : 1
                  }}
                >
                  {modalLoading ? "처리 중..." : "응찰하기"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결제 확인 모달 */}
        {payModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
          }}>
            <div style={{
              background: "#fff", borderRadius: "12px",
              padding: "36px 32px", width: "100%", maxWidth: "400px",
              display: "flex", flexDirection: "column", gap: "16px"
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 900 }}>결제 확인</h2>
              <p style={{ margin: 0, color: "#374151", fontSize: "14px", lineHeight: 1.8 }}>
                아래 방법 중 하나를 선택하신 후 신청 버튼을 눌러주세요.
                신청 완료 후 안내 메일이 발송됩니다.
                <br /><br />
                <strong>① 계좌이체</strong><br />
                입금 계좌 정보는 낙찰 확정 메일을 확인해주세요.<br /><br />
                <strong>② 방문 결제</strong><br />
                영업시간(월~금 10:00 ~ 18:00) 내 방문 후 카드 결제가 가능합니다.
                <br /><br />
                <span style={{ color: "#dc2626", fontSize: "13px" }}>
                  ⚠ 실제 결제 완료 전 확인 버튼을 누르실 경우 불이익이 발생할 수 있습니다.
                </span>
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setPayModal(false)}
                  style={{
                    flex: 1, height: "44px", border: "1px solid #d1d5db",
                    borderRadius: "8px", background: "#fff",
                    fontWeight: 700, cursor: "pointer"
                  }}
                >
                  취소
                </button>
                <button
                  onClick={onPayConfirm}
                  disabled={payLoading}
                  style={{
                    flex: 1, height: "44px", border: 0,
                    borderRadius: "8px", background: "#111827",
                    color: "#fff", fontWeight: 800,
                    cursor: payLoading ? "not-allowed" : "pointer",
                    opacity: payLoading ? 0.7 : 1
                  }}
                >
                  {payLoading ? "처리 중..." : "결제 신청하기"}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className={`to-top ${showTop ? "is-show" : ""}`}
          onClick={onTop}
          aria-label="페이지 최상단으로 이동"
        >
          <i className="fa-solid fa-arrow-up" />
        </button>
      </main>
    </div>
  );
}

function Bullet({ text }) {
  return (
    <div className="bullet">
      <i className="fa-solid fa-circle"></i>
      <p>{text}</p>
    </div>
  );
}