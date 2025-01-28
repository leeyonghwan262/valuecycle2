'use client';

import React, { useState } from 'react';
import styles from './design-analysis.module.css';

export default function DesignAnalysisClient() {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  // 이미지 선택
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewSrc(url);
    }
  };

  // "이미지 분석" 버튼
  const handleAnalyze = () => {
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 3000);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>디자인 분석하기</h1>

      {/* 로딩 비디오 */}
      <div
        className={
          loading
            ? `${styles.loadingVideoContainer} ${styles.loadingVideoVisible}`
            : styles.loadingVideoContainer
        }
      >
        <video autoPlay loop muted width="800" height="450">
          <source src="/assets/videos/loading.mp4" type="video/mp4" />
          브라우저에서 video 태그를 지원하지 않습니다.
        </video>
        <p className={styles.loadingMessage}>
          벨류싸이클AI에서 15분 걸리던
          <br />
          디자인 분석을 20초 만에 처리중입니다....
        </p>
      </div>

      {/* 업로드 폼 */}
      <form className={styles.form}>
        <label>이미지를 업로드하세요:</label>
        <input
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleImageChange}
        />
        <div className={styles.inputField}>
          <label>사용자 ID</label>
          <input type="text" placeholder="예: Alice" className={styles.textInput} />
        </div>
        <label>아이템 메인 키워드:</label>
        <textarea rows={2} placeholder="예: 가죽필통" className={styles.textarea} />
        <label>주 타겟의 성별과 연령대:</label>
        <textarea rows={2} placeholder="예: 30대 남성" className={styles.textarea} />
        <label>상위 카테고리 3가지 입력:</label>
        <textarea rows={2} placeholder="예: 패션, 인테리어, 그래픽" className={styles.textarea} />
        <label>디자인 그래프 위치 (예: 캐주얼 & 마니악 등):</label>
        <textarea rows={2} placeholder="예: 캐주얼 & 마니악" className={styles.textarea} />
        
        <button type="button" onClick={handleAnalyze} className={styles.analyzeButton}>
          이미지 분석
        </button>
      </form>

      {/* 미리보기 */}
      <div
        className={
          previewSrc
            ? `${styles.previewContainer} ${styles.previewVisible}`
            : styles.previewContainer
        }
      >
        {previewSrc && (
          <img src={previewSrc} alt="미리보기" className={styles.previewImage} />
        )}
      </div>

      {/* 결과 */}
      <div
        className={
          showResult
            ? `${styles.resultContainer} ${styles.resultVisible}`
            : styles.resultContainer
        }
      >
        <p className={styles.resultDesc}>
          분석 결과를 여기에 표시합니다.
        </p>
        <div style={{ marginTop: '20px' }}>
          {/* 그래프 등 추가 UI */}
        </div>
      </div>
    </div>
  );
}
