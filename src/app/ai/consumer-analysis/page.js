"use client";

import { useEffect } from 'react';
import styles from './consumer-analysis.module.css';

export default function ConsumerAnalysisPage() {
  useEffect(() => {
    const askButton = document.getElementById("ask-button");
    const forbiddenMessage = document.getElementById("forbidden-message");

    const forbiddenWords = ["챗gpt", "챗지피티", "프롬프트", "프롬프터", "명령어"];

    function containsForbiddenWords(input) {
      return forbiddenWords.some(word => input.toLowerCase().includes(word));
    }

    if (askButton) {
      askButton.addEventListener("click", () => {
        const gender = document.getElementById("target-gender").value.trim();
        const age = document.getElementById("target-age").value.trim();
        const item = document.getElementById("item").value.trim();
        const trend = document.getElementById("trend").value.trim();
        const question = `${gender} ${age} ${item} ${trend}`;

        if (containsForbiddenWords(question)) {
          forbiddenMessage.style.display = "block";
        } else {
          forbiddenMessage.style.display = "none";
          // ... fetch('/analyze-consumer', ...) 등 로직
        }
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* 헤드라인 */}
      <h1 className={styles.headline}>벨류싸이클 1단계, 구매욕구 해킹</h1>

      {/* 상단 영역 (topContainer) */}
      <div className={styles.topContainer}>
        <div 
          /* 질문 박스(회색) → .box 클래스 */
          className={styles.box}
          id="question-container" // (JS로 쓰실거면 ID 유지)
        >
          {/* 아이템 입력 */}
          <div className={styles.inputField}>
            <label className={styles.inputLabel} htmlFor="item">
              분석하려는 아이템:
            </label>
            <textarea
              id="item" // 로직용 ID
              rows={1}
              placeholder="예: 가죽 필통"
              className={styles.textareaBox} // 스타일
            ></textarea>
          </div>

          {/* 사용자 ID */}
          <div className={styles.inputField}>
            <label className={styles.inputLabel} htmlFor="username">
              사용자 ID
            </label>
            <input
              id="username"
              type="text"
              placeholder="예: Alice"
              className={styles.inputBox}
            />
          </div>

          {/* 주 타겟의 성별 */}
          <div className={styles.inputField}>
            <label className={styles.inputLabel} htmlFor="target-gender">
              주 타겟의 성별:
            </label>
            <select
              id="target-gender"
              className={styles.selectBox}
            >
              <option value="">성별을 선택하세요</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="기타">남성&여성 비슷</option>
            </select>
          </div>

          {/* 주 타겟의 연령대 */}
          <div className={styles.inputField}>
            <label className={styles.inputLabel} htmlFor="target-age">
              주 타겟의 연령대:
            </label>
            <select
              id="target-age"
              className={styles.selectBox}
            >
              <option value="">연령대를 선택하세요</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대~50대</option>
            </select>
          </div>

          {/* 1페이지 트렌드 3가지 */}
          <div className={styles.inputField}>
            <label className={styles.inputLabel} htmlFor="trend">
              1페이지 트렌드 3가지:
            </label>
            <textarea
              id="trend"
              placeholder="예: 트렌드 1, 트렌드 2, 트렌드 3"
              rows={2}
              className={styles.textareaBox}
            ></textarea>
          </div>
        </div>

        {/* 질문 예시 박스 → .exampleBox */}
        <div className={styles.exampleBox} id="example">
          {/* 버튼 */}
          <button
            id="ask-button" // JS 로직용 ID
            className={`${styles.button} ${styles.askButton}`}
          >
            벨류싸이클 해킹하기
          </button>

          <p>
            <span className={styles.highlight}>&nbsp;&nbsp;질문 예시:</span>
            <br /><br />
          </p>
          <ul>

          <li>
              키워드는 키워드 수가 가장 큰 <br />
              메인 키워드를 적어주면 됩니다.
            </li>
            <br/>
            <li>
              성별과 연령대는 키워드 도구에서<br />
              가장 많은 것을 골라주면 됩니다.<br />
             
            </li>
            <br/>
            <li>
              트렌드 3개를 적을 때는 1페이지를<br />
              분석하며 전체적으로 보이는 특징 <br />
              3가지를 적어주면 됩니다. (스펙&디자인)
            </li>
            <br/>
            <li>
              EX)<br />1.전체적으로 사이즈가 작은 편.<br />
              2.브라운,블랙,파스텔 컬러가 많아.<br />
              3.귀엽고 캐쥬얼하거나, 고급스럽고 <br />
                남자다운 것들이 많아.
            </li>
          </ul>
        </div>
      </div>

      {/* 이미지 컨테이너 (기본 display: none) */}
      <div
        id="image-container"
        className={styles.imageContainer}
      >
        <img
          id="response-image"
          src="assets/images/diagram.jpg"
          alt="diagram"
          className={styles.responseImage}
        />
      </div>

      {/* 금지 단어 메시지 */}
      <div
        id="forbidden-message"
        className={styles.forbiddenMessage}
      >
        금지된 단어가 포함되어 있습니다.
      </div>

      {/* 초기화 버튼 (clearButton) */}
      <button
        id="clear-button"
        className={`${styles.button} ${styles.clearButton}`}
      >
        초기화 - 처음화면으로 돌아갑니다.
      </button>

      {/* 답변 영역 */}
      <div
        id="answer-container"
        className={styles.answerContainer}
      >
        <p id="answer">
          오래 기다리셨습니다. 드디어 소비자의 구매욕구를 벨류해킹에 성공했습니다.
        </p>
      </div>

      {/* 포매팅된 답변 (기본 display: none) */}
      <div
        id="formatted-answer-container"
        style={{ display: 'none', textAlign: 'left' }}
      >
        <br /><br />
        <span className={styles.highlight}>1. 첫 번째 이유:</span><br /><br />
        (예시 내용)
      </div>

      {/* 로딩 비디오 */}
      <div
        id="loading-video-container"
        className={styles.loadingVideoContainer}
      >
        <video
          id="loading-video"
          className={styles.loadingVideo}
          autoPlay
          loop
          muted
          width="800"
          height="450"
        >
          <source src="assets/videos/loading.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          id="loading-message"
          className={styles.loadingMessage}
        >
          현재 벨류해킹중입니다...
        </div>
      </div>

      {/* 중복 #answer가 아래에도 있으니, 필요 없으면 제거 */}
      <div id="answer"></div>
    </div>
  );
}
