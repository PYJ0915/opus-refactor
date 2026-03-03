import { useState } from "react";
import axiosApi from "../../api/axiosAPI";
import { toast } from "react-toastify";

export const useAuthValidation = () => {
  const [isTelChecked, setIsTelChecked] = useState(false);

  const handlePhoneChange = (value, setPhoneNumber) => {
    const rawValue = value.replace(/[^0-9]/g, "");
    let formattedValue = "";

    if (rawValue.length <= 3) {
      formattedValue = rawValue;
    } else if (rawValue.length <= 7) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }

    setPhoneNumber(formattedValue);
    setIsTelChecked(false);
  };

  const handleCheckTel = async (tel) => {
    const rawPhone = tel.replace(/[^0-9]/g, "");

    if (!rawPhone) {
      toast.error("연락처를 입력해주세요.", {
        toastId: "tel-empty",
      });
      return false;
    }

    if (rawPhone.length < 10) {
      toast.error("올바른 연락처를 입력해주세요.", {
        toastId: "tel-invalid",
      });
      return false;
    }

    try {
      const res = await axiosApi.post("/auth/check-tel", {
        memberTel: rawPhone,
      });

      if (res.data === true) {
        toast.error("이미 등록된 연락처입니다.", {
          toastId: "tel-duplicate",
        });
        setIsTelChecked(false);
        return false;
      }

      toast.success("사용 가능한 연락처입니다.", {
        toastId: "tel-available",
      });
      setIsTelChecked(true);
      return true;

    } catch (err) {
      const errorMsg =
        err.response?.data || "연락처 중복 확인 중 오류가 발생했습니다.";

      toast.error(errorMsg, {
        toastId: "tel-check-error",
      });

      setIsTelChecked(false);
      return false;
    }
  };

  const checkPwMatch = (pw, confirm) => {
    return pw !== "" && pw === confirm;
  };

  return {
    isTelChecked,
    setIsTelChecked,
    handleCheckTel,
    handlePhoneChange,
    checkPwMatch,
  };
};