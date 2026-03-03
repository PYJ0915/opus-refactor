import { useEffect, useMemo, useState } from "react";
import "../../css/AddressModal.css";
import { useAddressStore } from "../../store/useAddressStore";
import { useDaumPostcodePopup } from "react-daum-postcode";

const AddressModal = ({ isOpen, onClose, onApply }) => {

  // 저장 배송지 모드 상태
  const [mode, setMode] = useState("SELECT"); // SELECT | MANAGE | FORM

  // 새로 작성한 배송지 상태
  const [editingAddress, setEditingAddress] = useState(null);

  // 직접입력 선택 시 텍스트 상자 열림 여부 상태
  const [onTextarea, setOnTextarea] = useState(false);

  // 배송 메모 타입 상태
  const [selectedMemoType, setSelectedMemoType] = useState("");  // select 전용

  // 직접 입력 내용 상태
  const [customMemo, setCustomMemo] = useState("");  // textarea 전용

  // 주소 검색어 상태
  const [query, setQuery] = useState("");

  // 배송지 입력 상태
  const [form, setForm] = useState({
    recipient: "",
    recipientTel: "",
    postcode: "",
    basicAddress: "",
    detailAddress: "",
    deliveryReq: "",
    isDefault: "N"
  });
  
  // 선택 주소 임시 저장 상태
  const [tempSelectedId, setTempSelectedId] = useState(null);

  // 주소 상태 관리
  const {
    addresses,
    selectedAddressId,
    setDefaultAddress,
    selectAddress,
    addAddress,
    updateAddress,
    deleteAddress
  } = useAddressStore();

  // 주소 저장 핸들러
  const handleSave = async () => {
    try {

      if (editingAddress) {
        // 수정
        console.log("==== 주소 수정 시작 ====")
        await updateAddress(editingAddress.addressNo, form);
        alert("배송지가 수정되었습니다!");
      } else {
        // 신규 추가
        console.log("==== 주소 추가 시작 ====")
        await addAddress(form);
        alert("배송지가 추가되었습니다!");
      }

      // 공통 후처리
      setEditingAddress(null);
      setMode("MANAGE");

    } catch (error) {
      console.error(error);
      alert("저장에 실패했습니다.");
    }

  };

  // 주소 삭제 핸들러
  const handleDelete = async (id) => {
    if (!confirm("배송지를 삭제하시겠습니까?")) return;

    try {
      console.log("==== 주소 삭제 시작 ====")
      await deleteAddress(id);
      alert("배송지가 삭제되었습니다!");
    } catch (error) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }

  };

  const handleSetDefault = async (id) => {
    console.log("==== 기본 배송지 설정 시작 ====")
    await setDefaultAddress(id);
    selectAddress(id); // 기본 배송지로 바꾸면서 선택도 같이
    console.log("기본 배송지 설정 완료")
  };

  /* 모달 열릴 때 초기화 */
  useEffect(() => {
    if (!isOpen) return;

    const defaultAddr = addresses.find(a => a.isDefault === "Y");
    setTempSelectedId(selectedAddressId ?? defaultAddr?.addressNo ?? null);

    setMode("SELECT");
  }, [isOpen, addresses, selectedAddressId]);

  // ===== 다음 주소 API =====
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
      postcode
    }));

  };

  const handleClick = () => {
    open({ onComplete: handleComplete });
  };
// ============================================

// 주소 검색
  const filteredAddresses = useMemo(() => {
      if (!addresses) return [];

      const refinedQuery = query.trim().toLowerCase();
  
      return addresses.filter((item) => {
        const matchesQuery = refinedQuery
          ? item.recipient.toLowerCase().includes(refinedQuery)
          : true;
  
        return  matchesQuery;
      });
    }, [addresses, query]);


  // FORM 진입 시 값 세팅
  useEffect(() => {
    if (mode !== "FORM") return;

    if (editingAddress) {
      // 작성한 주소가 존재할 때
      setForm({
        recipient: editingAddress.recipient,
        recipientTel: editingAddress.recipientTel,
        postcode: editingAddress.postcode,
        basicAddress: editingAddress.basicAddress,
        detailAddress: editingAddress.detailAddress ?? "",
        deliveryReq: editingAddress.deliveryReq ?? "",
        isDefault: editingAddress.isDefault ?? "N"
      });

      // 배송 메모가 미리 정의된 옵션인지 확인
      const predefinedOptions = [
        "문 앞에 놓아주세요",
        "경비실에 맡겨주세요",
        "배송 전 연락 부탁드려요"
      ];

      // 배송메모가 존재하면서 미리 정의된 옵션과 같지 않을 때
      if (editingAddress.deliveryReq &&
        !predefinedOptions.includes(editingAddress.deliveryReq)) {
        // 미리 정의되지 않은 메모 = 직접 입력
        setSelectedMemoType("직접 입력");
        setCustomMemo(editingAddress.deliveryReq);  // customMemo에 값 설정
        setOnTextarea(true);
      } else { 
        // 배송메모가 존재하면서 미리 정의된 옵션과 같을 때
        setSelectedMemoType(editingAddress.deliveryReq ?? "");
        setCustomMemo("");  // customMemo 초기화
        setOnTextarea(false);
      }

    } else {
      // 작성한 주소가 없을 때
      setForm({
        recipient: "",
        recipientTel: "",
        postcode: "",
        basicAddress: "",
        detailAddress: "",
        deliveryReq: "",
        isDefault: "N"
      });

      //상태 초기화
      setSelectedMemoType("");
      setCustomMemo("");
      setOnTextarea(false);
    }
  }, [mode, editingAddress]);

  // 배송 메모 선택 핸들러
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
    }
  };

  // 직접 입력 핸들러
  const handleCustomMemoChange = (e) => {
    const value = e.target.value;
    setCustomMemo(value);
    setForm(prev => ({
      ...prev,
      deliveryReq: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="checkout_modal-overlay">
      <div className="checkout_modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="checkout_modal__header">
          <h3 className="checkout_modal__title">저장된 배송지</h3>
          <button type="button" className="checkout_modal__close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Tools */}
        <div className="checkout_modal__tools">
          {mode === "SELECT" && (
            <>
              <input
                type="text"
                className="checkout_input checkout_modal__search"
                placeholder="배송지명/주소 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="addr--btn addr-btn--outline addr-btn--sm"
                onClick={() => setMode("MANAGE")}
              >
                배송지 관리
              </button>
            </>
          )}

          {mode === "MANAGE" && (
            <div className="checkout_modal__tools-right">
              <button
                type="button"
                className="addr-btn addr-btn--outline addr-btn--sm"
                onClick={() => {
                  setEditingAddress(null);
                  setMode("FORM");
                }}
              >
                배송지 추가
              </button>
              <button
                type="button"
                className="addr-btn addr-btn--outline addr-btn--sm"
                onClick={() => setMode("SELECT")}
              >
                취소
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="checkout_modal__body">

          {/* 주소 리스트 */}
          {(mode === "SELECT" || mode === "MANAGE") && (
            <div className="checkout_addr-list">
              {filteredAddresses.length === 0 ? (
                <p className="addr-msg">저장된 배송지가 없습니다.</p>
              ) : (
                filteredAddresses.map((addr) =>
                  mode === "SELECT" ? (
                    <label
                      key={addr.addressNo}
                      className="checkout__addr-item"
                      data-selectable="true"
                    >
                      {/* SELECT일 때만 radio */}
                      <input
                        className="checkout__addr-radio"
                        type="radio"
                        name="savedAddr"
                        checked={tempSelectedId === addr.addressNo}
                        onChange={() => setTempSelectedId(addr.addressNo)}
                      />

                      <div className="checkout__addr-item__box">
                        <div className="checkout_addr-item__top" />

                        <p className="checkout_addr-item__who">
                          {addr.recipient} · {addr.recipientTel}
                        </p>
                        <p className="checkout_addr-item__addr">{addr.basicAddress} {addr.detailAddress}</p>

                        {addr.isDefault === "Y" && (
                          <span className="checkout_addr-badge">기본 배송지</span>
                        )}
                      </div>
                    </label>
                  ) : (
                    <div
                      key={addr.addressNo}
                      className="checkout__addr-item"
                      data-selectable="false"
                    >
                      <div className="checkout__addr-item__box">
                        <div className="checkout_addr-item__top" />

                        <p className="checkout_addr-item__who">
                          {addr.recipient} · {addr.recipientTel}
                        </p>
                        <p className="checkout_addr-item__addr">{addr.basicAddress} {addr.detailAddress}</p>

                        {/* MANAGE일 때만 버튼 */}
                        <div className="checkout_addr-actions">
                          {addr.isDefault !== "Y" && (
                            <button
                              type="button"
                              className="addr-btn addr-btn--outline addr-btn--sm"
                              id="default-btn"
                              onClick={() => handleSetDefault(addr.addressNo)}
                            >
                              기본 배송지로 설정
                            </button>
                          )}

                          <button
                            type="button"
                            className="addr-btn addr-btn--outline addr-btn--sm"
                            onClick={() => {
                              setEditingAddress(addr);
                              setMode("FORM");
                            }}
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            className="checkout_btn checkout_btn--danger addr-btn--sm"
                            onClick={() => handleDelete(addr.addressNo)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}


          {/* FORM (단 하나) */}
          {mode === "FORM" && (
            <div className="checkout_modal__form">
              <form className="checkout_form" onSubmit={(e) => e.preventDefault()}>
                <div className="checkout_grid">
                  <div className="checkout_field">
                    <label className="checkout_label">수령인</label>
                    <input
                      className="checkout__input"
                      type="text"
                      placeholder="이름"
                      value={form.recipient}
                      onChange={(e) => setForm(prev => ({ ...prev, recipient: e.target.value }))}
                    />
                  </div>

                  <div className="checkout_field">
                    <label className="checkout_label">연락처</label>
                    <input
                      className="checkout__input"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={form.recipientTel}
                      onChange={(e) => setForm(prev => ({ ...prev, recipientTel: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="checkout__grid">
                  <div className="checkout__field checkout_field--wide">
                    <label className="checkout__label">주소</label>
                    <div className="checkout_addr-row">
                      <input
                        className="checkout__input"
                        type="text"
                        placeholder="우편번호"
                        value={form.postcode}
                        readOnly
                      />
                      <button
                        className="addr-btn addr-btn--outline addr-btn--sm"
                        type="button"
                        onClick={handleClick}
                      >
                        주소 검색
                      </button>
                    </div>
                  </div>

                  <div className="checkout__field checkout_field--wide">
                    <input
                      className="checkout__input"
                      type="text"
                      placeholder="기본 주소"
                      value={form.basicAddress}
                      readOnly
                    />
                  </div>

                  <div className="checkout__field checkout_field--wide">
                    <input
                      className="checkout__input"
                      type="text"
                      placeholder="상세 주소"
                      value={form.detailAddress}
                      onChange={(e) => setForm(prev => ({ ...prev, detailAddress: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="checkout__field">
                  <label className="checkout__label">배송 메모</label>
                  <select
                    className="checkout__select"
                    value={selectedMemoType}
                    onChange={handleMemoSelect}
                  >
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="checkout_modal__footer">
          {mode === "SELECT" && (
            <>
              <button type="button" className="addr-btn addr-btn--outline" onClick={onClose}>
                취소
              </button>
              <button
                type="button"
                className="addr-btn addr-btn--solid"
                onClick={() => onApply(tempSelectedId)}
              >
                선택한 배송지 적용
              </button>
            </>
          )}

          {mode === "FORM" && (
            <>
              <button
                type="button"
                className="addr-btn addr-btn--outline"
                onClick={() => {
                  setEditingAddress(null);
                  setMode("MANAGE")
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="addr-btn addr-btn--solid"
                onClick={handleSave}
              >
                {editingAddress ? "수정 저장" : "배송지 추가"}
              </button>
            </>
          )}
        </div>

      </div >
    </div >
  );
};

export default AddressModal;
