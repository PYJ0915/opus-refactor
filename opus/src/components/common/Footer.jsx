import { NavLink } from 'react-router-dom';
import '../../css/common/Footer.css'

function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <h3 className="footer__brand">OPUS</h3>
            <p className="footer__desc">문화예술의 모든 것을 한 곳에서</p>
          </div>

          <div>
            <h4 className="footer__title">서비스</h4>
            <ul className="footer__links">
              <li>
                <NavLink
                  to="/onStage"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  On-Stage
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/proposals"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  Proposals
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/unveiling"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  Unveiling
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/selections"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  Selections
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer__title">고객지원</h4>
            <ul className="footer__links">
              <li>
                <NavLink
                  to="/proposals"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  공지사항
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/faq"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  FAQ
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer__title">정보</h4>
            <ul className="footer__links">
              <li>
                <NavLink
                  to="/terms"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  이용약관
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/privacy"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  개인정보처리방침
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `gnb__link ${isActive ? "is-active" : ""}`
                  }
                >
                  회사 소개
                </NavLink>
                </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 OPUS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;