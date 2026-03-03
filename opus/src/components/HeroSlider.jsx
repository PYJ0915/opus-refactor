import { useState, useEffect } from "react";
import exam1 from "../assets/HeroExam.png";
import exam2 from "../assets/OnStageExam.jpg";
import exam3 from "../assets/artExam.jpg";
import exam4 from "../assets/stageExam.png";
import exam5 from "../assets/abstractExam.png";

const SLIDES = [
  { title: "OPUS", content: "작품을 보는 새로운 관점을 열고, 숨겨진 예술의 무대를 드러내다", img: exam1 },
  { title: "On-Stage", content: "현재 관람가능한 전시와 공연을 확인하실 수 있습니다", img: exam2 },
  { title: "Proposals", content: "전시와 공연에 관한 정보를 담아 정중히 제안드립니다", img: exam3 },
  { title: "Unveiling", content: "직접 명작을 소장할 수 있는 기회의 막이 열립니다", img: exam4 },
  { title: "Selections", content: "예술적 여운을 이어갈 소품을 모아뒀어요", img: exam5 },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setIndex((index - 1 + SLIDES.length) % SLIDES.length);
  const next = () =>
    setIndex((index + 1) % SLIDES.length);

  return (
    <section id="hero-banner" className="hero">
      <div className="hero__bg">
        <img
          className="hero__img"
          src={SLIDES[index].img}
          alt="elegant theatrical stage with dramatic red curtains and spotlight, cinematic photography"
        />
      </div>

      <button className="hero__nav hero__nav--left" onClick={prev}>
        <i className="fa-solid fa-chevron-left" />
      </button>

      <button className="hero__nav hero__nav--right" onClick={next}>
        <i className="fa-solid fa-chevron-right" />
      </button>

      <div className="hero__content">
        <div className="wrap">
          <div className="hero__text">
            <h1 className="hero__title">{SLIDES[index].title}</h1>
            <p className="hero__place">
              {SLIDES[index].content}
            </p>
            {SLIDES[index].title === "OPUS" ? (
              <>
                <p className="hero__date"><b>O</b>pening</p>
                <p className="hero__date"><b>P</b>erspective,</p>
                <p className="hero__date"><b>U</b>nveiling</p>
                <p className="hero__date"><b>S</b>cene</p>
              </>
            ) : null}

          </div>
        </div>
      </div>

      <div className="hero__bottom">
        <div className="dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? "is-active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <div className="hero__count">
          <span>{index + 1}</span> / {SLIDES.length}
        </div>
      </div>
    </section>
  );
}
