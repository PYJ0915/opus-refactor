import { useEffect, useState } from "react";
import HeroSlider from "../components/HeroSlider";
import MdPickSlider from "../components/MdPickSlider";
import { getAllExhibitions, getCachedExhibitions } from "../api/kcisaAPI";
import { getAllMusicals, dateRange, getCachedMusicals } from "../api/kopisAPI";

const EXHIBITION_KEY = import.meta.env.VITE_KCISA_KEY;
const MUSICAL_KEY = import.meta.env.VITE_KOPIS_KEY;

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

function checkImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = toHttps(url);
  });
}

async function filterValidImages(items, getUrl, getKey, count) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const valid = [];
  const seenKeys = new Set();

  for (const item of shuffled) {
    if (valid.length >= count) break;
    const key = getKey(item);
    if (!key || seenKeys.has(key)) continue;
    const rawUrl = getUrl(item);
    if (!rawUrl) continue;
    const ok = await checkImage(toHttps(rawUrl));
    if (ok) {
      seenKeys.add(key);
      valid.push({
        ...item,
        image: item.image ? toHttps(item.image) : item.image,
        poster: item.poster ? toHttps(item.poster) : item.poster,
      });
    }
  }
  return valid;
}

// StageCache → MdPickSlider exhibition 호환 형태
function cacheToExhibition(c) {
  return {
    exhibitionId: c.stageNo,
    title: c.stageTitle,
    image: c.stageThumbnail,
    period: c.stagePeriod,
    place: c.stagePlace,
  };
}

// StageCache → MdPickSlider musical 호환 형태
function cacheToMusical(c) {
  const [from = "", to = ""] = (c.stagePeriod ?? "").split("~").map((s) => s.trim());
  return {
    mt20id: c.stageNo,
    prfnm: c.stageTitle,
    poster: c.stageThumbnail,
    prfpdfrom: from,
    prfpdto: to,
    fcltynm: c.stagePlace,
    prfstate: "",
  };
}

const PICK_COUNT = Math.random() < 0.5 ? 5 : 6;

export default function Home() {
  const [exhibitionPicks, setExhibitionPicks] = useState([]);
  const [musicalPicks, setMusicalPicks] = useState([]);

  useEffect(() => {
    // 전시
    (async () => {
      try {
        const items = await getAllExhibitions({ serviceKey: EXHIBITION_KEY, pageParam: 1 });
        const active = items.filter((item) => getExhibitionStatus(item.period) !== "03");
        const valid = await filterValidImages(active, (item) => item.image, (item) => item.exhibitionId, PICK_COUNT);
        if (valid.length > 0) {
          setExhibitionPicks(valid);
          return;
        }
        throw new Error("유효한 이미지 없음");
      } catch (e) {
        console.warn("전시 외부 API 실패, 캐시로 대체:", e);
        try {
          const cached = await getCachedExhibitions(30);
          const converted = cached.map(cacheToExhibition);
          const valid = await filterValidImages(converted, (item) => item.image, (item) => item.exhibitionId, PICK_COUNT);
          setExhibitionPicks(valid.length > 0 ? valid : converted.slice(0, PICK_COUNT));
        } catch (cacheErr) {
          console.error("전시 캐시도 실패:", cacheErr);
        }
      }
    })();

    // 뮤지컬
    (async () => {
      try {
        const range = dateRange[1];
        const result = await getAllMusicals({ serviceKey: MUSICAL_KEY, startDate: range.start, endDate: range.end, pageParam: 1, rows: 50 });
        const active = result.items.filter((item) => item.prfstate !== "공연완료");
        const valid = await filterValidImages(active, (item) => item.poster, (item) => item.mt20id, PICK_COUNT);
        if (valid.length > 0) {
          setMusicalPicks(valid);
          return;
        }
        throw new Error("유효한 이미지 없음");
      } catch (e) {
        console.warn("뮤지컬 외부 API 실패, 캐시로 대체:", e);
        try {
          const cached = await getCachedMusicals(30);
          const converted = cached.map(cacheToMusical);
          const valid = await filterValidImages(converted, (item) => item.poster, (item) => item.mt20id, PICK_COUNT);
          setMusicalPicks(valid.length > 0 ? valid : converted.slice(0, PICK_COUNT));
        } catch (cacheErr) {
          console.error("뮤지컬 캐시도 실패:", cacheErr);
        }
      }
    })();
  }, []);

  return (
    <>
      <HeroSlider />
      <MdPickSlider title="Exhibitions, you better go" data={exhibitionPicks} type="exhibition" />
      <MdPickSlider title="Musicals, you better go" data={musicalPicks} type="musical" />
    </>
  );
}