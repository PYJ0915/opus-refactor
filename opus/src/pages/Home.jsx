import { useEffect, useState } from "react";
import HeroSlider from "../components/HeroSlider";
import MdPickSlider from "../components/MdPickSlider";
import { getAllExhibitions } from "../api/kcisaAPI";
import { getAllMusicals, dateRange } from "../api/kopisAPI";

const EXHIBITION_KEY = "bcec5111-252e-47c3-9dca-4b943cf5a0ed";
const MUSICAL_KEY = "f8d2111671454d7bb5b0102d85c7cf1c";

function parsePeriod(period) {
  if (!period || !period.includes("~")) return null;
  const [start, end] = period.split("~").map((d) => d.trim());
  const toDate = (str) => new Date(Number(str.slice(0, 4)), Number(str.slice(5, 7)) - 1, Number(str.slice(8, 10)));
  return { startDate: toDate(start), endDate: toDate(end) };
}

function toHttps(url) {
  if (!url) return "";
  return url.replace(/^http:\/\//, "https://");
}

function getExhibitionStatus(period) {
  const parsed = parsePeriod(period);
  if (!parsed) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < parsed.startDate) return "01";
  if (today > parsed.endDate) return "03";
  return "02";
}

function shuffleAndPick(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 이미지 URL이 실제로 로드되는지 사전 검증
function checkImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = toHttps(url);
  });
}

// 이미지 검증 통과한 항목만 필터링 후 N개 반환
async function filterValidImages(items, getUrl, count) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const valid = [];
  for (const item of shuffled) {
    if (valid.length >= count) break;

    const rawUrl = getUrl(item);
    if (!rawUrl) continue;

    const httpsUrl = toHttps(rawUrl);
    const ok = await checkImage(httpsUrl);

    if (ok) {
      valid.push({
        ...item,
        image: item.image ? toHttps(item.image) : item.image,
        poster: item.poster ? toHttps(item.poster) : item.poster,
      });
    }
  }

  return valid;
}

const PICK_COUNT = Math.random() < 0.5 ? 5 : 6;

export default function Home() {
  const [exhibitionPicks, setExhibitionPicks] = useState([]);
  const [musicalPicks, setMusicalPicks] = useState([]);

  useEffect(() => {
    // 전시 — 종료작 제외 + 이미지 사전 검증 후 5개
    (async () => {
      try {
        const items = await getAllExhibitions({ serviceKey: EXHIBITION_KEY, pageParam: 1 });
        const active = items.filter((item) => getExhibitionStatus(item.period) !== "03");
        const valid = await filterValidImages(active, (item) => item.image, PICK_COUNT);
        setExhibitionPicks(valid);
      } catch (e) {
        console.error("전시 MD픽 로드 실패:", e);
      }
    })();

    // 뮤지컬 — 종료작 제외 + 이미지 사전 검증 후 5개
    (async () => {
      try {
        const range = dateRange[1];
        const result = await getAllMusicals({
          serviceKey: MUSICAL_KEY,
          startDate: range.start,
          endDate: range.end,
          pageParam: 1,
          rows: 50,
        });
        const active = result.items.filter((item) => item.prfstate !== "공연완료");
        const valid = await filterValidImages(active, (item) => item.poster, PICK_COUNT);
        setMusicalPicks(valid);
      } catch (e) {
        console.error("뮤지컬 MD픽 로드 실패:", e);
      }
    })();
  }, []);

  return (
    <>
      <HeroSlider />

      <MdPickSlider
        title="Exhibitions, you better go"
        data={exhibitionPicks}
        type="exhibition"
      />

      <MdPickSlider
        title="Musicals, you better go"
        data={musicalPicks}
        type="musical"
      />
    </>
  );
}