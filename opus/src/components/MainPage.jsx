import React from "react";
import '../css/index.css';
import HeroBg1 from "../assets/HeroBanner1st.png";

const Main = () => {
  return (
    <>
      <body>
        <header id="header" class="header header--overlay">


          <div className="wrap header__inner">
            <div className="header__left">
              <span href="#" className="brand">OPUS</span>

              <nav className="gnb">
                <span href="#" className="gnb__link">Proposals</span>
                <span href="#" className="gnb__link">On-Stage</span>
                <span href="#" className="gnb__link">Unveiling</span>
                <span href="#" className="gnb__link">Selections</span>
              </nav>
            </div>

            <div className="header__right">
              <button className="icon-btn" type="button" aria-label="마이페이지">
                <i className="fa-regular fa-user" aria-hidden="true"></i>
              </button>
              {/* <!-- <button type="button">로그아웃</button> --> */}
            </div>
          </div>
        </header>

        <section id="hero-banner" className="hero">
          <div className="hero__bg">
            <img
              className="hero__img"
              src={HeroBg1}
              alt="elegant theatrical stage with dramatic red curtains and spotlight, cinematic photography"
            />
          </div>

          <button id="prev-slide" className="hero__nav hero__nav--left" type="button" aria-label="이전">
            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>

          <button id="next-slide" className="hero__nav hero__nav--right" type="button" aria-label="다음">
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>

          <div className="hero__content">
            <div className="wrap">
              <div className="hero__text">
                <h1 className="hero__title">OPUS</h1>
                <p className="hero__place">작품을 보는 새로운 관점을 열고, 숨겨진 예술의 무대를 드러내다.</p>
                <p className="hero__date"><b>O</b>pening</p>
                <p className="hero__date"><b>P</b>erspective</p>
                <p className="hero__date"><b>U</b>nveiling</p>
                <p className="hero__date"><b>S</b>cene</p>
              </div>
            </div>
          </div>

          <div className="hero__bottom">
            <div className="dots" aria-label="슬라이드 페이지">
              <button className="dot is-active" type="button" aria-label="1"></button>
              <button className="dot" type="button" aria-label="2"></button>
              <button className="dot" type="button" aria-label="3"></button>
              <button className="dot" type="button" aria-label="4"></button>
            </div>

            <div className="hero__count">
              <span id="current-time">3</span> / 10
            </div>
          </div>
        </section>

        {/* <!-- ART MD PICK --> */}
        <section id="art-md-pick" className="section section--alt">
          <div className="wrap">
            <div className="section__head">
              <h2 className="section__title">전시 MD Pick</h2>
            </div>

            <div className="card-grid">
              <article className="card">
                <div className="card__thumb card__thumb--white">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58a2095d97-9bd16223f914cf35d1fa.png"
                    alt="contemporary art exhibition poster with abstract colorful painting"
                  />
                  <button className="like-btn" type="button" aria-label="찜">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                  </button>
                </div>
                <h3 className="card__title">모네: 빛의 순간</h3>
                <p className="card__meta">2024.01.10 - 2024.04.20</p>
                <p className="card__sub">국립현대미술관</p>
              </article>

              <article className="card">
                <div className="card__thumb card__thumb--white">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/2874bd2599-f479c9013a644132c97a.png"
                    alt="modern art exhibition poster featuring geometric sculptures"
                  />
                </div>
                <h3 className="card__title">백남준의 세계</h3>
                <p className="card__meta">2024.02.05 - 2024.05.15</p>
                <p className="card__sub">서울시립미술관</p>
              </article>

              <article className="card">
                <div className="card__thumb card__thumb--white">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/dc60bffba9-132dffe3468580d0765f.png"
                    alt="impressionist art exhibition poster with dreamy landscape painting"
                  />
                </div>
                <h3 className="card__title">반 고흐: 별이 빛나는 밤</h3>
                <p className="card__meta">2024.03.01 - 2024.06.10</p>
                <p className="card__sub">예술의전당 한가람미술관</p>
              </article>

              <article className="card">
                <div className="card__thumb card__thumb--white">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/acf0e512e6-f7755634f24d30b38138.png"
                    alt="contemporary photography exhibition poster with black and white artistic photo"
                  />
                </div>
                <h3 className="card__title">사진으로 보는 한국</h3>
                <p className="card__meta">2024.01.25 - 2024.04.30</p>
                <p className="card__sub">리움미술관</p>
              </article>

              <article className="card">
                <div className="card__thumb card__thumb--white">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/9afde8ec45-856b049fb1470d994044.png"
                    alt="classical art exhibition poster with renaissance painting style"
                  />
                  <button className="like-btn" type="button" aria-label="찜">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                  </button>
                </div>
                <h3 className="card__title">르네상스의 거장들</h3>
                <p className="card__meta">2024.02.20 - 2024.05.30</p>
                <p className="card__sub">DDP 디자인뮤지엄</p>
              </article>
            </div>
          </div>
        </section>

        {/* <!-- MUSICAL MD PICK --> */}
        <section id="musical-md-pick" className="section">
          <div className="wrap">
            <div className="section__head">
              <h2 className="section__title">공연 MD Pick</h2>
            </div>

            <div className="card-grid">
              {/* <!-- Card 1 --> */}
              <article className="card">
                <div className="card__thumb">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/e0a92d3d57-9293bb4aba30302c1c0a.png"
                    alt="musical poster design for Phantom of the Opera, elegant theatrical artwork"
                  />
                </div>
                <h3 className="card__title">오페라의 유령</h3>
                <p className="card__meta">2024.01.15 - 2024.04.30</p>
                <p className="card__sub">샤롯데씨어터</p>
              </article>

              {/* <!-- Card 2 --> */}
              <article className="card">
                <div className="card__thumb">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/072b5ca667-a72d65c97bb76eeb858a.png"
                    alt="musical poster design for Wicked, magical green themed theatrical artwork"
                  />
                  <button className="like-btn" type="button" aria-label="찜">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                  </button>
                </div>
                <h3 className="card__title">위키드</h3>
                <p className="card__meta">2024.02.01 - 2024.05.31</p>
                <p className="card__sub">블루스퀘어</p>
              </article>

              {/* <!-- Card 3 --> */}
              <article className="card">
                <div className="card__thumb">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/6663746987-6e4025959e6230cb2a79.png"
                    alt="musical poster design for Chicago, jazz age art deco style theatrical artwork"
                  />
                  <button className="like-btn" type="button" aria-label="찜">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                  </button>
                </div>
                <h3 className="card__title">시카고</h3>
                <p className="card__meta">2024.03.10 - 2024.06.20</p>
                <p className="card__sub">디큐브아트센터</p>
              </article>

              {/* <!-- Card 4 --> */}
              <article className="card">
                <div className="card__thumb">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/a212ec033b-0624b1e5152a1d3d115e.png"
                    alt="musical poster design for Cats, feline themed theatrical artwork with dancers"
                  />
                  <button className="like-btn" type="button" aria-label="찜">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                  </button>
                </div>
                <h3 className="card__title">캣츠</h3>
                <p className="card__meta">2024.01.20 - 2024.04.15</p>
                <p className="card__sub">LG아트센터</p>
              </article>

              {/* <!-- Card 5 --> */}
              <article className="card">
                <div className="card__thumb">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/8149baeb41-a1a4a706604ad7874149.png"
                    alt="musical poster design for Les Miserables, dramatic revolutionary france themed theatrical artwork"
                  />
                  <button className="like-btn" type="button" aria-label="찜">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                  </button>
                </div>
                <h3 className="card__title">레미제라블</h3>
                <p className="card__meta">2024.02.15 - 2024.05.25</p>
                <p className="card__sub">예술의전당</p>
              </article>
            </div>
          </div>
        </section>
      </body>
    </>
  )
};

export default Main;