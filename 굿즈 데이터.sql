/* =====================================================
   GOODS / GOODS_OPTION / GOODS_IMG DUMMY DATA
   ===================================================== */

--------------------------------------------------
-- 1. MUSICAL / CLOTHES (옵션 3개 → 유지)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '뮤지컬 로고 티셔츠',
  'musical',
  'clothes',
  '뮤지컬 공식 로고가 프린트된 베이직 티셔츠',
  'OPUS',
  39000,
  3000,
  SYSDATE - 30,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'S', 'BLACK', 20);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'M', 'BLACK', 30);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'L', 'BLACK', 25);

INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_tshirt_thumb.jpg', 'm_clothes_01_0.jpg', 0);
INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_tshirt_detail.jpg', 'm_clothes_01_1.jpg', 1);

--------------------------------------------------
-- 2. MUSICAL / ACCESSORIES (옵션 2개 → 유지)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '뮤지컬 캐릭터 키링',
  'musical',
  'accessories',
  '뮤지컬 캐릭터를 활용한 아크릴 키링',
  'OPUS',
  12000,
  3000,
  SYSDATE - 29,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, 'SILVER', 100);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, 'GOLD', 60);

INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_keyring_thumb.jpg', 'm_acc_02_0.jpg', 0);
INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_keyring_detail.jpg', 'm_acc_02_1.jpg', 1);

--------------------------------------------------
-- 3. MUSICAL / RECORD (옵션 2개 → 유지)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '뮤지컬 OST CD',
  'musical',
  'record',
  '뮤지컬 오리지널 캐스트 OST CD',
  'OPUS',
  22000,
  3000,
  SYSDATE - 28,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, 'STANDARD', 80);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, 'LIMITED', 30);

INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_ost_thumb.jpg', 'm_record_03_0.jpg', 0);
INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_ost_detail.jpg', 'm_record_03_1.jpg', 1);

--------------------------------------------------
-- 4. MUSICAL / STATIONERY (옵션 1개 → 옵션 없음 형태로 변경)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '뮤지컬 가사 엽서 세트',
  'musical',
  'stationery',
  '뮤지컬 명대사를 담은 엽서 10종 세트',
  'OPUS',
  10000,
  0,
  SYSDATE - 27,
  'N'
);

-- 옵션 없음(사이즈/색상 NULL, 재고만)
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, NULL, 120);

INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_postcard_thumb.jpg', 'm_stat_04_0.jpg', 0);
INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'musical_postcard_detail.jpg', 'm_stat_04_1.jpg', 1);

--------------------------------------------------
-- 5. EXHIBITION / POSTER (옵션 2개 → 유지)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '전시 한정 포스터 A2',
  'exhibition',
  'poster',
  '전시 대표 작품을 담은 A2 사이즈 포스터',
  'OPUS',
  25000,
  0,
  SYSDATE - 26,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, 'MATTE', 60);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, 'GLOSSY', 40);

INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'ex_poster_thumb.jpg', 'e_poster_05_0.jpg', 0);
INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'ex_poster_detail.jpg', 'e_poster_05_1.jpg', 1);

--------------------------------------------------
-- 6. EXHIBITION / STATIONERY (옵션 1개 → 옵션 없음 형태로 변경)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '전시 엽서 세트',
  'exhibition',
  'stationery',
  '전시 작품으로 구성된 엽서 12종 세트',
  'OPUS',
  14000,
  0,
  SYSDATE - 25,
  'N'
);

-- 옵션 없음(사이즈/색상 NULL, 재고만)
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, NULL, 150);

INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'ex_postcard_thumb.jpg', 'e_stat_06_0.jpg', 0);
INSERT INTO GOODS_IMG VALUES (SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
'/images/goods/', 'ex_postcard_detail.jpg', 'e_stat_06_1.jpg', 1);

--------------------------------------------------
-- 7. EXHIBITION / ACCESSORIES (옵션 1개 → 옵션 없음)
--------------------------------------------------
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '전시 아트 배지 세트',
  'exhibition',
  'accessories',
  '전시 아트워크 배지 3종 세트',
  'OPUS',
  13000,
  3000,
  SYSDATE - 24,
  'N'
);

-- 옵션 없음 (사이즈/색상 NULL, 재고만 관리)
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  90
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'ex_badge_thumb.jpg',
  'e_acc_07_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'ex_badge_detail.jpg',
  'e_acc_07_1.jpg',
  1
);


-- 김기인 엽서

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '김기린 엽서 <안과밖>',
  'exhibition',
  'poster',
  '김기린, <안과밖>, 1983' || CHR(10) || CHR(10) ||
  '캔버스에 유화 물감' || CHR(10) ||
  '248 × 199.5 cm' || CHR(10) || CHR(10) ||
  '국립현대미술관 소장' || CHR(10) ||
  'MMCA Collection' || CHR(10) || CHR(10) ||
  'KIM Guiline, Inside and Outside, 1983' || CHR(10) ||
  'Oil paint on canvas, 248 × 199.5 cm',
  'MMCA',
  2500,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  100
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'kim_girlin_inside_outside_postcard.jpg',
  'e_poster_08_0.jpg',
  0
);

-- 김창열 물방울 손거울과 문진

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '김창열 물방울 손거울과 문진',
  'exhibition',
  'etc',
  '김창열 작가의 1960년대 ''물방울'' 회화 전조작품을 담은 굿즈 세트입니다.' || CHR(10) || CHR(10) ||
  '- 구성 : 손거울 1개 + 문진 1개' || CHR(10) ||
  '- 재료 : 아크릴, 크리스탈' || CHR(10) ||
  '- 사이즈 : 손거울 100 x 100 x H5 mm / 문진 70 x 70 x H45 mm' || CHR(10) || CHR(10) ||
  '[사용 및 보관 안내]' || CHR(10) ||
  '- 장시간 직사광선을 피하고, 보관 시 그늘진 장소를 선택해 주세요.' || CHR(10) ||
  '- 강한 충격/낙하 및 날카로운 물체로 인한 손상에 유의해 주세요.' || CHR(10) || CHR(10) ||
  '[손거울 관리]' || CHR(10) ||
  '- 세척 시 강한 화학 세제 사용을 삼가고, 세척 후 완전히 건조해 보관해 주세요.' || CHR(10) ||
  '- 손의 유·수분으로 얼룩이 생길 수 있으므로 부드러운 천으로 닦아 보관해 주세요.' || CHR(10) || CHR(10) ||
  '뮤지엄 아카이브의 신서연 작가와 협력하여 제작되었습니다.',
  '국립현대미술관문화재단',
  58000,
  0,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '컬러',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '흑백',
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김창열 물방울 손거울과 문진 썸네일.jpg',
  'e_etc_09_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김창열 물방울 손거울과 문진 컬러.jpg',
  'e_etc_09_1.jpg',
  1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김창열 물방울 손거울과 문진 흑백.jpg',
  'e_etc_09_2.jpg',
  2
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김창열 물방울 손거울과 문진 상세 1.jpg',
  'e_etc_09_3.jpg',
  3
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김창열 물방울 손거울과 문진 상세2.jpg',
  'e_etc_09_4.jpg',
  4
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김창열 물방울 손거울과 문진 상세3.jpg',
  'e_etc_09_5.jpg',
  5
);

-- 론 뮤익 티셔츠 <쇼핑하는 여인>

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '론 뮤익 티셔츠 <쇼핑하는 여인>',
  'exhibition',
  'clothes',
  '인상적인 론 뮤익의 작품을 일상 속에서 함께하세요.' || CHR(10) || CHR(10) ||
  '앞면은 깔끔한 무지로, 뒷면은 큼지막한 작가의 설치 작품 이미지가 섬세하게 재현됐습니다.' || CHR(10) || CHR(10) ||
  '면 75.4% · 폴리 24.6% 코튼폴리 혼방 원단으로' || CHR(10) ||
  '산뜻함과 편안함을 동시에 느낄 수 있도록 제작됐습니다.' || CHR(10) || CHR(10) ||
  '계절에 따라 단독 또는 레이어드로 착용하기 좋은' || CHR(10) ||
  '기본 오버핏 실루엣이며, M / L 두 사이즈로 구성됩니다.' || CHR(10) || CHR(10) ||
  '리파인드 컨템포러리 브랜드 ''커스텀멜로우''가 제작에 참여해' || CHR(10) ||
  '우수한 퀄리티가 돋보이는 한정 제작 티셔츠입니다.',
  'MMCA',
  49000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'M', '그레이', 30);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'L', '그레이', 30);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'M', '오렌지', 30);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, 'L', '오렌지', 30);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '론 뮤익 티셔츠 쇼핑하는 여인 그레이.jpg',
  'e_clothes_10_0.jpg', 0
);
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '론 뮤익 티셔츠 쇼핑하는 여인 오렌지.jpg',
  'e_clothes_10_1.jpg', 1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '론 뮤익 티셔츠 쇼핑하는 여인 그레이 상세 1.jpg',
  'e_clothes_10_2.jpg', 2
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '론 뮤익 티셔츠 쇼핑하는 여인 그레이 상세 2.jpg',
  'e_clothes_10_3.jpg', 3
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '론 뮤익 티셔츠 쇼핑하는 여인 오렌지 상세 1.jpg',
  'e_clothes_10_4.jpg', 4
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '론 뮤익 티셔츠 쇼핑하는 여인 전체 상세 1.jpg',
  'e_clothes_10_5.jpg', 5
);

-- 리추얼 스프레이 10ml

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '리추얼 스프레이 10ml',
  'exhibition',
  'etc',
  'MMCA 해외 명작: 수련과 상들리에에서 영감을 받은 리추얼 스프레이입니다.' || CHR(10) || CHR(10) ||
  '- 용량 : 10ml' || CHR(10) ||
  '- 옵션 : 르누아르 / 모네' || CHR(10) || CHR(10) ||
  '[르누아르 : Layers of the Senses]' || CHR(10) ||
  '- Notes : Rose absolute, rose ultimate extract, rose essential Low ME, violet absolute, geranium Bourbon, ho wood, patchouli, sandalwood Mysore, orris concrete, amber, cistus' || CHR(10) || CHR(10) ||
  '[모네 : Layers of Time]' || CHR(10) ||
  '- Notes : Bergamot (cold-pressed), lemon myrtle, Dalmatian sage, French lavender, white lotus absolute, ginger lily, agarwood absolute, sandalwood Mysore, frankincense, cistus' || CHR(10) || CHR(10) ||
  '작품의 분위기를 향으로 확장해 일상 속 감각적인 순간을 더해줍니다.',
  '국립현대미술관문화재단',
  21000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, '르누아르', 50);
INSERT INTO GOODS_OPTION VALUES (SEQ_GOODS_OPTION.NEXTVAL, SEQ_GOODS.CURRVAL, NULL, '모네',     50);


INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '르누아르.jpg',
  'e_etc_11_0.jpg', 0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '르누아르 상세 .jpg',
  'e_etc_11_1.jpg', 1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '모네.jpg',
  'e_etc_11_2.jpg', 2
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL, SEQ_GOODS.CURRVAL,
  '/images/goods/', '모네 상세.jpg',
  'e_etc_11_3.jpg', 3
);

-- 신상호 브로치

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '신상호 브로치',
  'exhibition',
  'accessories',
  '신상호 작가의 대표 연작 <무한변주 Infinite Metamorphoses>에서 모티프를 가져온 브로치입니다.' || CHR(10) || CHR(10) ||
  '반복과 변형, 구조와 힘의 개념을 기반으로 한 조형 언어를' || CHR(10) ||
  '작은 액세서리 오브제로 재해석하여 일상 속에서 착용할 수 있도록 제작되었습니다.' || CHR(10) || CHR(10) ||
  '- 컬러 옵션 : 네이비 / 오렌지 / 분청' || CHR(10) ||
  '- 소재 : 아크릴, 레진, 금속' || CHR(10) || CHR(10) ||
  '[취급 시 주의사항]' || CHR(10) ||
  '- 레진 소재 특성상 강한 충격에 의해 균열이나 파손이 발생할 수 있습니다.' || CHR(10) ||
  '- 직사광선, 물기, 화학 제품과의 접촉을 피해 주세요.' || CHR(10) ||
  '- 사용 후에는 스크래치 방지를 위해 부드러운 천으로 닦아 케이스에 보관해 주세요.',
  '국립현대미술관문화재단',
  45000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '네이비',
  30
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '오렌지',
  30
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '분청',
  30
);


INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '신상호 브로치.jpg',
  'e_accessories_12_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '신상호 브로치 상세1.jpg',
  'e_accessories_12_1.jpg',
  1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '신상호 브로치 상세2.jpg',
  'e_accessories_12_2.jpg',
  2
);

-- 양혜규 <소리 나는 가물> 뱃지

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '양혜규 <소리 나는 가물> 뱃지',
  'exhibition',
  'accessories',
  'MMCA 현대차 시리즈 일곱 번째 작가로 선정된 양혜규 작가의 작품 세계를 담은 전시 연계 뱃지입니다.' || CHR(10) || CHR(10) ||
  '1990년대 중반부터 서울과 베를린을 기반으로 활동해온 양혜규 작가는' || CHR(10) ||
  '일상, 산업, 유사-민속적 성격의 재료를 활용해 서사와 추상, 이주와 경계라는' || CHR(10) ||
  '동시대적 주제를 위계 없이 작품에 담아내는 작가로 평가받고 있습니다.' || CHR(10) || CHR(10) ||
  '이번 전시에서는 작가의 조형 언어를 반영한 <소리 나는 가물> 연작을' || CHR(10) ||
  '다양한 형태의 뱃지로 구성하여 일상 속에서 작품을 경험할 수 있도록 했습니다.' || CHR(10) || CHR(10) ||
  '- 옵션 : 솥 겹 솥 / 게 걸음질 드라이기 / 조개 집게 / 다림질 가위',
  '국립현대미술관문화재단',
  18000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '솥 겹 솥',
  30
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '게 걸음질 드라이기',
  30
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '조개 집게',
  30
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '다림질 가위',
  30
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '양혜규 소리 나는 가물 뱃지.jpg',
  'e_accessories_13_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '양혜규 소리 나는 가물 솥겹솥 뱃지.jpg',
  'e_accessories_13_1.jpg',
  1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '양혜규 소리 나는 가물 게걸음질 드라이기 뱃지.jpg',
  'e_accessories_13_2.jpg',
  2
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '양혜규 소리 나는 가물 조개 집게 뱃지.jpg',
  'e_accessories_13_3.jpg',
  3
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '양혜규 소리 나는 가물 다림질 가위 뱃지.jpg',
  'e_accessories_13_4.jpg',
  4
);

-- 오지호 아트프린트 <남향집>

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '오지호 아트프린트 <남향집>',
  'exhibition',
  'poster',
  '해당 상품은 액자를 포함하지 않는 아트프린트입니다.' || CHR(10) || CHR(10) ||
  '전문 아트프린트 공방에서 여러 차례의 테스트를 거쳐' || CHR(10) ||
  '작품의 색감과 질감을 최대한 충실히 구현하여 제작되었습니다.' || CHR(10) || CHR(10) ||
  '오지호, <남향집>, 1939' || CHR(10) ||
  '캔버스에 유화 물감, 80 × 65 cm' || CHR(10) ||
  '국립현대미술관 소장' || CHR(10) || CHR(10) ||
  'Oh Chiho, A House Facing South, 1939' || CHR(10) ||
  'Oil paint on canvas, 80 × 65 cm' || CHR(10) ||
  'MMCA Collection',
  'MMCA',
  120000,
  0,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  20
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '오지호 아트프린트 남향집.jpg',
  'e_poster_14_0.jpg',
  0
);

-- 장욱진 <까치> 마그넷

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '장욱진 <까치> 마그넷',
  'exhibition',
  'etc',
  '아크릴 소재로 제작되어, 선명한 색감과 깔끔한 마감이 특징입니다.' || CHR(10) || CHR(10) ||
  '기존 낱장이던 마그넷 디자인을 덮개형으로 제작하여' || CHR(10) ||
  '휴대성과 실용성은 유지하면서 보관이 더욱 용이하도록 개선했습니다.' || CHR(10) || CHR(10) ||
  '냉장고, 메모판, 책상 주변 등 다양한 공간에 쉽게 부착할 수 있으며' || CHR(10) ||
  '선물용으로도 활용하기 좋습니다.' || CHR(10) || CHR(10) ||
  '장욱진(1917~1990) CHANG Uc-chin' || CHR(10) ||
  '장욱진은 근대 한국 미술의 대표적 작가로, 유화를 공부하며 독자적인 작품 세계를 구축했습니다.' || CHR(10) ||
  '국립중앙박물관 근무 및 서울대학교 미술대학 교수로 재직한 이후에도 그림에 전념했으며,' || CHR(10) ||
  '주변 풍경과 동물, 가족 등 일상적 소재를 바탕으로 한 작품을 남겼습니다.' || CHR(10) ||
  '향토적·유희적 감정과 풍류적 심성이 담긴 화면은 많은 대중에게 사랑받는 특징입니다.',
  'MMCA',
  9000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '장욱진 까치 마그넷 썸네일.jpg',
  'e_etc_15_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '장욱진 까치 마그넷 상세 1.jpg',
  'e_etc_15_1.jpg',
  1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '장욱진 까치 마그넷 상세 2.jpg',
  'e_etc_15_2.jpg',
  2
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '장욱진 까치 마그넷 상세 3.jpg',
  'e_etc_15_3.jpg',
  3
);

-- 팬레터 대본집

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '팬레터 대본집',
  'musical',
  'archive',
  '뮤지컬 <팬레터> 10주년을 기념해 제작된 공식 대본집입니다.
노출 제본 방식으로 제작되어 펼침이 자연스럽고,
공연의 대사와 장면 흐름을 온전히 감상할 수 있도록 구성되었습니다.

※ 사용하시는 휴대폰, 모니터 기종 및 설정에 따라
실제 색상과 차이가 있을 수 있습니다.',
  'LIVE',
  15000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  100
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_script_thumb.jpg',
  'm_archive_16_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_script_detail_1.jpg',
  'm_archive_16_1.jpg',
  1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_script_detail_2.jpg',
  'm_archive_16_2.jpg',
  2
);

-- 팬레터 악보집

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '팬레터 악보집',
  'musical',
  'record',
  '뮤지컬 <팬레터>의 넘버를 수록한 공식 악보집입니다.
공연의 음악적 흐름을 그대로 담아,
연주·연습·소장용으로 모두 활용할 수 있도록 구성되었습니다.

※ 사용하시는 휴대폰, 모니터 기종 및 설정에 따라
대본집 실제 색상과 차이가 있을 수 있습니다.',
  'LIVE',
  20000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  100
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_score_thumb.jpg',
  'm_record_17_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_score_detail.jpg',
  'm_record_17_1.jpg',
  1
);


-- 팬레터 뱃지 3종
INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '팬레터 뱃지 3종',
  'musical',
  'accessories',
  '뮤지컬 <팬레터> 10주년을 기념해 제작된 공식 뱃지입니다.

작품 속 주요 장면과 상징적인 이미지를 담아
각기 다른 매력을 지닌 3종 구성으로 선보입니다.

의상이나 가방, 파우치 등에 포인트로 활용하기 좋으며
<팬레터>를 기억하고 간직하기에 적합한 소장용 굿즈입니다.',
  'LIVE',
  11000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '해진의 편지 뱃지',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '겨울 뱃지',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '조광 뱃지',
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_badge_thumb.jpg',
  'e_accessories_18_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_badge_detail_1.jpg',
  'e_accessories_18_1.jpg',
  1
);

-- 팬레터 우표 스티커

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '팬레터 우표 스티커',
  'musical',
  'poster',
  '뮤지컬 <팬레터> 10주년을 기념해 제작된 공식 우표 스티커입니다.

작품 속 소품과 상징적인 이미지를 우표 형태의 일러스트로 구성해
팬레터의 분위기를 섬세하게 담아냈습니다.

다이어리, 엽서, 포장 등에 활용하기 좋으며
작품을 좋아하는 관객에게 작은 선물처럼 즐길 수 있는 굿즈입니다.',
  'LIVE',
  5000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  100
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_stamp_sticker_thumb.jpg',
  'p_poster_19_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'fanletter_stamp_sticker_detail_1.jpg',
  'p_poster_19_1.jpg',
  1
);

-- 웃는 남자 대본집

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '웃는 남자 대본집',
  'musical',
  'archive',
  '뮤지컬 <웃는 남자>의 공식 대본집입니다.

작품의 서사와 대사를 온전히 담아
공연의 감동을 다시 되새길 수 있도록 구성되었습니다.

뮤지컬 <웃는 남자>를 사랑하는 관객과
작품을 깊이 이해하고 싶은 분들께 추천하는 아카이브 굿즈입니다.',
  'EMK',
  13000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'the_man_who_laughs_script_thumb.jpg',
  'm_archive_19_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'the_man_who_laughs_script_detail_1.jpg',
  'm_archive_19_1.jpg',
  1
);

-- 웃는 남자 악보집

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '웃는 남자 악보집',
  'musical',
  'record',
  '뮤지컬 <웃는 남자>의 주요 넘버를 수록한 공식 악보집입니다.

작품의 감정선을 그대로 느낄 수 있도록
피아노·보컬 구성으로 편집되었으며,
무대 위 음악을 일상에서도 연주하고 감상할 수 있습니다.

공연을 기억하는 관객은 물론,
연주자와 팬 모두에게 소장 가치가 높은 아카이브 굿즈입니다.',
  'EMK',
  11000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'laughingman_score_thumb.jpg',
  'e_record_21_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'laughingman_score_detail_1.jpg',
  'e_record_21_1.jpg',
  1
);

-- 웃는 남자 문진 (뮤지컬 / etc)

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '웃는 남자 문진',
  'musical',
  'etc',
  '뮤지컬 <웃는 남자> 공식 굿즈 문진입니다.

공연의 무드가 담긴 그래픽과 문구를 원형 디자인으로 담아
데스크 위 포인트 오브제로 두기 좋습니다.

박스 포장 구성으로 보관 및 선물용으로도 적합합니다.
(SIZE 60×60 표기 기준)',
  'EMK',
  20000,
  3000,
  SYSDATE,
  'N'
);

-- 옵션 없음 → NULL로 1개 생성
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

-- 이미지
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'laughingman_paperweight_thumb.jpg',
  'm_etc_22_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'laughingman_paperweight_detail_1.jpg',
  'm_etc_22_1.jpg',
  1
);

-- 웃는 남자 극세사 담요

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '웃는 남자 극세사 담요',
  'musical',
  'clothes',
  '뮤지컬 <웃는 남자>의 상징적인 오브제를 감각적으로 담아낸 극세사 담요입니다.

밤하늘을 연상시키는 블랙 배경 위에 작품 속 아이콘들이 흩뿌려진 디자인으로,
공연의 여운을 일상 속에서도 따뜻하게 느낄 수 있도록 제작되었습니다.

부드러운 극세사 소재로 보온성이 뛰어나며,
소파나 침실에서 활용하기 좋은 실용적인 굿즈입니다.',
  'EMK',
  40000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  30
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'manwho_laughs_blanket_thumb.jpg',
  'm_clothes_23_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'manwho_laughs_blanket_detail_1.jpg',
  'm_clothes_23_1.jpg',
  1
);

-- 홍련 프로그램북

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '[홍련] 프로그램북',
  'musical',
  'archive',
  '뮤지컬 <홍련> 초연을 기념해 제작된 공식 프로그램북입니다.

작품의 세계관을 깊이 있게 담은 캐릭터 설명과
창작진 및 출연진 인터뷰,
프로덕션 노트와 주요 수록 글을 통해
공연의 여운을 오래 간직할 수 있도록 구성되었습니다.

공연을 관람한 관객은 물론,
작품을 기록하고 소장하고자 하는 분들께
의미 있는 아카이브 굿즈입니다.',
  'Martin Entertainment',
  12000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'hongryeon_programbook_thumb.jpg',
  'm_archive_24_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'hongryeon_programbook_detail_1.jpg',
  'm_archive_24_1.jpg',
  1
);

-- 홍련 실황 OST

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '[홍련] LIVE RECORDING OST',
  'musical',
  'record',
  '뮤지컬 <홍련> 공연 실황을 수록한 공식 라이브 OST입니다.

각 캐스트 조합별로 구성된 CD 음원이 수록되어 있으며,
작품의 감정과 서사를 생생하게 다시 감상할 수 있는 소장용 음반입니다.',
  'Martin Entertainment',
  45000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'hongryeon_ost_thumb.jpg',
  'm_record_25_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'hongryeon_ost_detail_1.jpg',
  'm_record_25_1.jpg',
  1
);

-- 홍련 마이크 뱃지
/* 26번 상품 : [홍련] 마이크 뱃지 */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '[홍련] 마이크 뱃지',
  'musical',
  'accessories',
  '뮤지컬 <홍련> MD로 제작된 마이크 뱃지입니다.

무대 위 ‘마이크’ 오브제를 모티프로 한 굿즈로,
공연의 분위기와 기록의 의미를 담아 소장하기 좋습니다.

가방, 파우치, 의류 등에 포인트로 활용할 수 있는
공식 기념 굿즈입니다.',
  'Martin Entertainment',
  12000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

-- 이미지
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '홍련 마이크 뱃지.jpg',
  'm_accessories_26_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '홍련 마이크 뱃지 상세.jpg',
  'm_accessories_26_1.jpg',
  1
);

/* 27번 상품 : 에어로센 포스터 Aerocene Poster */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '에어로센 포스터 Aerocene Poster',
  'exhibition',
  'poster',
  '포스터와 린넨 가방의 판매 수익금 전액은 이번 전시 종료 후
에어로센이 지속적으로 협업 중인 아르헨티나 북부 후후이에 위치한
살리나스 그란데스와 과야타욕 염호의 원주민 커뮤니티에 전달될 예정입니다.

이 수익금은 리튬 채굴이 이 지역의 인간과 인간 이상의 생태계에
미치는 파괴적인 영향에 맞서 싸우는 이들의 투쟁을 지원하며,
지구와 주민들에 대한 환경적·윤리적 약속을 강화하는 데 사용됩니다.',
  'LEEUM PRODUCT',
  134000,
  0,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '에어로센 포스터 썸네일.jpg',
  'e_poster_27_0.jpg',
  0
);

-- 상세
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '에어로센 포스터 상세.jpg',
  'e_poster_27_1.jpg',
  1
);

/* 28번 상품 : 이불 크로스백 Lee Bul Cross Bag */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '이불 크로스백 Lee Bul Cross Bag',
  'exhibition',
  'clothes',
  '이불 작가가 제안한 초록, 파랑, 회색의 감각적인 색상이 조화를 이루는 대형 토트백입니다.

넉넉한 수납 공간으로 노트북, 책, 개인 소지품까지 여유롭게 담을 수 있어
일상은 물론 전시 관람, 여행, 업무에도 모두 잘 어울립니다.

실용성과 예술성을 동시에 담은 이 토트백은,
일상 속에서도 작가의 세계관을 가까이에서 느낄 수 있는 특별한 아이템입니다.',
  'LEEUM PRODUCT',
  42000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '블루',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '그린',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '그레이',
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '이불 크로스백 썸네일.jpg',
  'e_clothes_28_0.jpg',
  0
);

-- 상세1
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '이불 크로스백 상세1.jpg',
  'e_clothes_28_1.jpg',
  1
);

-- 상세2
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '이불 크로스백 상세2.jpg',
  'e_clothes_28_2.jpg',
  2
);

-- 상세3
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '이불 크로스백 상세3.jpg',
  'e_clothes_28_3.jpg',
  3
);

/* 29번 상품 : 피에르 위그 '리미널' 마스킹 테이프 */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '피에르 위그 ''리미널'' 마스킹 테이프',
  'exhibition',
  'etc',
  '리움미술관은 현대미술의 고정된 형식을 깨고 끊임없이 새로운 세계를 탐구해 온 세계적 작가
피에르 위그의 아시아 최초 개인전 《리미널》의 굿즈를 소개합니다.

피에르 위그의 전시 그래픽이 포인트로 프린팅 된 마스킹 테이프입니다.',
  'LEEUM PRODUCT',
  4000,
  3000,
  SYSDATE,
  'N'
);

-- 옵션 없음
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

-- 이미지
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '피에르 위그 ''리미널'' 마스킹 테이프 썸네일.jpg',
  'e_etc_29_0.jpg',
  0
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '피에르 위그 ''리미널'' 마스킹 테이프 상세.jpg',
  'e_etc_29_1.jpg',
  1
);

INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '피에르 위그 ''리미널'' 마스킹 테이프 상세2.jpg',
  'e_etc_29_2.jpg',
  2
);

/* 30번 상품 : KIYA KIM 실크 스카프 KIYA KIM's Silk Scarf */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  'KIYA KIM 실크 스카프 KIYA KIM''s Silk Scarf',
  'exhibition',
  'clothes',
  'KIYA KIM (키야킴)은 사유하는 감각으로 언어의 은유적 스펙트럼을 탐구하는 다매체 작가이다.

2008년 뉴욕으로 이주. SVA에서 아트 프랙티스 석사, FIT에서 패션 스타일링을 수료하였다.

2018년 퓰리처상 미술평론 부문 수상자인 제리 살츠(Jerry Saltz)는
“당신은 재료에 대한 이해나 인식이 탁월한 작가이며,
당신 자신이 하나의 작품이자 콘텐츠이며,
즉 문화 전반적인 영역에 파장을 미칠 수 있는 거대한 회사이자 훌륭한 예술가이다”라고 호평하였다.',
  'Leeum',
  58000,
  0,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'KIYA KIM 실크 스카프 썸네일.jpg',
  'e_clothes_30_0.jpg',
  0
);

-- 상세
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  'KIYA KIM 실크 스카프 상세 1.jpg',
  'e_clothes_30_1.jpg',
  1
);

/* 31번 상품 : 루이즈 부르주아 손수건 Louise Bourgeois Handkerchief */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '루이즈 부르주아 손수건 Louise Bourgeois Handkerchief',
  'exhibition',
  'clothes',
  '루이즈 부르주아의 대표작 <엄마>는 대리석 알을 품은 거대한 거미로
어머니에 대한 기억과 모성의 복합성을 나타냅니다.

내면의 상실과 불안을 예술로 직조하며 삶을 치유하고자 했던 작가의 모습은
거미가 자신의 몸에서 실을 뽑아내는 모습과 닮아 있습니다.

<엄마>의 실루엣이 프린트된 손수건은 흡수성이 우수한 면 소재에 재현되어
실용적으로 사용하실 수 있습니다.',
  'HOAM PRODUCT',
  21000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  'A',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  'B',
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '루이즈 부르주아 손수건 썸네일.jpg',
  'e_clothes_31_0.jpg',
  0
);

-- 상세1
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '루이즈 부르주아 손수건 상세 1.jpg',
  'e_clothes_31_1.jpg',
  1
);

-- 상세2
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '루이즈 부르주아 손수건 상세 2.jpg',
  'e_clothes_31_2.jpg',
  2
);

-- 상세3
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '루이즈 부르주아 손수건 상세 3.jpg',
  'e_clothes_31_3.jpg',
  3
);

/* 32번 상품 : 박수근 도자컵 */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '박수근 도자컵',
  'exhibition',
  'etc',
  '박수근 컵은 물레성형하여 그림을 양각으로 넣은 후
1,250도 환원번조 하였으며, 최대규 작가와 함께 제작하였습니다.

도자 컵은 양각 모양에 따라
청자(귀로) / 연청자(아기업은 소녀) 2가지 종류로 제작되었습니다.',
  '국립현대미술관문화재단',
  38000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '아기업은 소녀',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '귀로',
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '박수근 도자컵 썸네일.jpg',
  'e_etc_32_0.jpg',
  0
);

-- 상세1
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '박수근 도자컵 상세.jpg',
  'e_etc_32_1.jpg',
  1
);

-- 상세2
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '박수근 도자컵 상세2.jpg',
  'e_etc_32_2.jpg',
  2
);

-- 상세3
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '박수근 도자컵 상세3.jpg',
  'e_etc_32_3.jpg',
  3
);

-- 상세4
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '박수근 도자컵 상세4.jpg',
  'e_etc_32_4.jpg',
  4
);

/* 33번 상품 : 리움 가방 키링 Leeum Museum of Art Bag Keyring */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '리움 가방 키링 Leeum Museum of Art Bag Keyring',
  'exhibition',
  'accessories',
  '리움미술관 MI 로고와 심볼이 포인트로 디자인된 가방 키링입니다.

키링으로 사용하실 수 있으며,
가방에 걸어 액세서리로도 활용하실 수 있습니다.

블랙, 실버, 로즈골드 3가지 컬러로 제작되었습니다.',
  'LEEUM PRODUCT',
  21000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '로즈골드',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '실버',
  50
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  '블랙',
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '리움 가방 키링 Leeum Museum of Art Bag Keyring 썸네일.jpg',
  'e_accessories_33_0.jpg',
  0
);

-- 상세1
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '리움 가방 키링 Leeum Museum of Art Bag Keyring 상세1.jpg',
  'e_accessories_33_1.jpg',
  1
);

-- 상세2
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '리움 가방 키링 Leeum Museum of Art Bag Keyring 상세2.jpg',
  'e_accessories_33_2.jpg',
  2
);

-- 상세3
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '리움 가방 키링 Leeum Museum of Art Bag Keyring 상세3.jpg',
  'e_accessories_33_3.jpg',
  3
);

/* 34번 상품 : 김환기, Universe 5 IV-71 #200 아트프린트 */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '김환기, Universe 5 IV-71 #200 아트프린트',
  'exhibition',
  'poster',
  'KIM Whanki, Universe 5 IV-71 #200, 1971,
Oil on Cotton, 254x254cm

ⓒWhanki Foundation · Whanki Museum',
  'MMCA',
  12000,
  3000,
  SYSDATE,
  'N'
);

INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  NULL,
  NULL,
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김환기, Universe 5 IV-71 #200 아트프린트 썸네일.jpg',
  'e_poster_34_0.jpg',
  0
);

-- 상세
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '김환기, Universe 5 IV-71 #200 아트프린트 상세.jpg',
  'e_poster_34_1.jpg',
  1
);

/* 35번 상품 : <게임사회> 반팔 티셔츠 */

INSERT INTO GOODS VALUES (
  SEQ_GOODS.NEXTVAL,
  '<게임사회> 반팔 티셔츠',
  'exhibition',
  'clothes',
  '게임에서 얻어지는 즐거운 성취감을 상상하며 제작한 티셔츠입니다.

난이도에 따라 레벨이 달라지는 80~90년대 컴퓨터, 비디오 게임의 구성 속
마지막 화면의 문구를 연상하는 뒷면 프린팅이 인상적입니다.

무난한 회색 바탕에 경쾌한 노란색 코인과 구름 아이콘이
픽셀 문구와 함께 더해져 귀여운 느낌을 줍니다.',
  'MMCA',
  39800,
  3000,
  SYSDATE,
  'N'
);

-- M / 블랙
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  'M',
  '블랙',
  50
);

-- M / 화이트
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  'M',
  '화이트',
  50
);

-- M / 그레이
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  'M',
  '그레이',
  50
);

-- XL / 블랙
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  'XL',
  '블랙',
  50
);

-- XL / 화이트
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  'XL',
  '화이트',
  50
);

-- XL / 그레이
INSERT INTO GOODS_OPTION VALUES (
  SEQ_GOODS_OPTION.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  'XL',
  '그레이',
  50
);

-- 썸네일
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 썸네일.jpg',
  'e_clothes_35_0.jpg',
  0
);

-- 상세1
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 상세1.jpg',
  'e_clothes_35_1.jpg',
  1
);

-- 상세2
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 상세2.jpg',
  'e_clothes_35_2.jpg',
  2
);

-- 상세3
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 상세3.jpg',
  'e_clothes_35_3.jpg',
  3
);

-- 상세4
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 상세4.jpg',
  'e_clothes_35_4.jpg',
  4
);

-- 상세5
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 상세5.jpg',
  'e_clothes_35_5.jpg',
  5
);

-- 상세6
INSERT INTO GOODS_IMG VALUES (
  SEQ_GOODS_IMG.NEXTVAL,
  SEQ_GOODS.CURRVAL,
  '/images/goods/',
  '게임사회 반팔 티셔츠 상세6.jpg',
  'e_clothes_35_6.jpg',
  6
);

COMMIT;