// app/ai/ai-copywriting/page.js
"use client";

import { useState } from 'react';
import styles from './aiCopywriting.module.css'; // 로컬 CSS Module import
import Link from 'next/link';

export default function AICopywritingPage() {
  const [loading, setLoading] = useState(false);

  // 예시: 버튼 클릭 시 로딩 화면 보이기
  function handleGenerateBenefits() {
    setLoading(true);
    // 실제 AI 요청 로직 / fetch 등...
    setTimeout(() => {
      setLoading(false);
      // 예: 여기서 .answerContainer, .copywritingContainer 등을 보여줄 수도 있음
      // document.querySelector(...)로 제어하거나, React state로 conditionally 렌더링해도 됨
    }, 2000);
  }

  return (
    <div className={styles.pageContainer}>
      {/* 네비게이션 예시 */}
      <nav style={{ margin: '10px 0' }}>
        <Link href="/">홈으로 돌아가기</Link>
      </nav>

      {/* 재생성 컨테이너 (원래 #global-regenerate-container) */}
      <div className={styles.regenerateContainer}>
        <button className={styles.regenerateBtn}>재생성하기</button>
      </div>

      {/* 로딩 비디오 컨테이너 */}
      <div
        className={styles.loadingVideoContainer}
        style={{ display: loading ? 'flex' : 'none' }} // 로딩이면 보이기
      >
        <video className={styles.loadingVideo} autoPlay loop muted width={800} height={450}>
          <source src="/assets/videos/loading.mp4" type="video/mp4" />
          {/* fallback */}
          Your browser does not support the video tag.
        </video>
        <p className={styles.loadingMessage}>
          벨류싸이클AI에서 100분 정도 걸리던
          <br />
          카피라이팅 작업을 1분만에 처리중입니다....
        </p>
      </div>

      {/* 상단 입력 영역 (원래 #top-container) */}
      <div className={styles.topContainer}>
        <h1 className={styles.title}>AI 카피라이팅 생성기</h1>

        <div className={styles.inputField}>
          <label>사용자 ID</label>
          <input type="text" placeholder="예: Alice" className={styles.formControl} />
        </div>

        <div className={styles.inputField}>
          <label>키워드</label>
          <input type="text" className={styles.formControl} />
        </div>

        <div className={styles.inputField}>
          <label>상위 카테고리</label>
          <input type="text" className={styles.formControl} />
        </div>

        <div className={styles.inputField}>
          <label>성별</label>
          <select className={styles.formControl}>
            <option value="">선택</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className={styles.inputField}>
          <label>연령대</label>
          <select className={styles.formControl}>
            <option value="">선택</option>
            <option value="10대">10대</option>
            <option value="20대">20대</option>
            <option value="30대">30대</option>
            <option value="40대">40대</option>
            <option value="50대 이상">50대 이상</option>
          </select>
        </div>

        <div className={styles.inputField}>
          <label>용도</label>
          <input type="text" className={styles.formControl} />
        </div>

        <div className={styles.inputField}>
          <label>기능 1</label>
          <textarea className={styles.formControl} />
        </div>

        <div className={styles.inputField}>
          <label>기능 2</label>
          <textarea className={styles.formControl} />
        </div>

        <div className={styles.inputField}>
          <label>기능 3</label>
          <textarea className={styles.formControl} />
        </div>

        <button className={styles.localButton} onClick={handleGenerateBenefits}>
          기능/혜택/의미 분석하기
        </button>
      </div>

      {/* 답변 영역 (원래 #answer-container => styles.answerContainer) */}
      <div className={styles.answerContainer}>
        <div className={styles.answerElement}>
          {/* 여기에 AI의 분석 결과를 표시 */}
        </div>
        <button className={styles.localButton}>AI 카피라이팅 생성</button>
      </div>

      {/* 최종 카피라이팅 결과 영역 */}
      <div className={styles.copywritingContainer}>
        <div className={styles.copywritingResult}></div>
      </div>
    </div>
  );
}
