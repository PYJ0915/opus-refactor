import { Helmet } from "react-helmet-async";

export default function MetaTags({
  title = "OPUS — 예술을 한 곳에서",
  description = "전시·뮤지컬 정보, 미술품 경매, 문화 굿즈까지. OPUS에서 만나보세요.",
  image = "/og-default.png",
  url,
}) {
  const fullUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="OPUS" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}