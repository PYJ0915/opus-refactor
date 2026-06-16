import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getRecentlyViewed } from "../../utils/recentlyViewed";

export default function RecentlyViewed({ currentGoodsNo }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    // 현재 보고 있는 상품 제외
    setItems(all.filter(item => item.goodsNo !== currentGoodsNo));
  }, [currentGoodsNo]);

  if (items.length === 0) return null;

  return (
    <section style={{ marginTop: 80 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>최근 본 상품</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {items.map(item => (
          <NavLink key={item.goodsNo} to={`/selections/${item.goodsNo}`}
            style={{ textDecoration: "none", color: "inherit" }}>
            <div>
              <div style={{ background: "#f9fafb", borderRadius: 8, overflow: "hidden",
                            aspectRatio: "1/1", marginBottom: 10 }}>
                <img
                  src={`${import.meta.env.VITE_API_URL}${item.goodsThumbnail}`}
                  alt={item.goodsName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{item.goodsName}</p>
              <p style={{ fontSize: 14, color: "#374151" }}>{Number(item.goodsPrice).toLocaleString()}원</p>
            </div>
          </NavLink>
        ))}
      </div>
    </section>
  );
}