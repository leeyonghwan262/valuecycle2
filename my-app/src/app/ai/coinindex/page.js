"use client"; // 브라우저 환경에서 동작하는 Client Component
import { useState } from "react";
import styles from "./coinindex.module.css"; // 위에서 만든 CSS Module

export default function CoinIndexPage() {
  // 1) 상태 정의
  const [username, setUsername] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [result, setResult] = useState(""); // 결과 텍스트
  const [showResult, setShowResult] = useState(false); // 결과 박스 표시 여부
  const [showCouponInput, setShowCouponInput] = useState(false); // 쿠폰 입력 영역 표시 여부

  // 서버 URL (예시)
  const BASE_URL = "http://localhost:3000";

  // 2) 결과를 표시하는 함수
  function showResultBox(message) {
    setShowResult(true); // 결과 영역 보이기
    if (typeof message === "object") {
      // JSON 형태라면 prettify
      setResult(JSON.stringify(message, null, 2));
    } else {
      setResult(message);
    }
  }

  // 3) 잔액 + 사용내역 조회
  async function handleCheckBalance() {
    if (!username.trim()) {
      showResultBox("username을 입력하세요.");
      return;
    }
    const url = `${BASE_URL}/coin/balance?username=${encodeURIComponent(username.trim())}`;
    try {
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        // 서버 에러 응답
        showResultBox(data);
      } else {
        // data = { balance, history } 가정
        let output = "";
        const balance = data.balance !== undefined ? data.balance : 0;
        output += `잔액: ${balance}\n\n`;

        if (Array.isArray(data.history)) {
          output += `사용내역:\n`;
          if (data.history.length === 0) {
            output += "  (사용 내역이 없습니다)\n";
          } else {
            data.history.forEach((item, i) => {
              output += `  ${i + 1}. ${JSON.stringify(item)}\n`;
            });
          }
        } else {
          output += "(사용내역 정보가 없습니다.)\n";
        }
        showResultBox(output);
      }
    } catch (err) {
      showResultBox(err.message);
    }
  }

  // 4) "코인 추가하기" 버튼 -> 쿠폰 입력창 보이기 토글
  function handleShowCouponInput() {
    setShowCouponInput(!showCouponInput);
  }

  // 5) 코드 입력 -> 코인 지급 (POST /coin/assign)
  async function handleAssignCode() {
    if (!username.trim() || !couponCode.trim()) {
      showResultBox("username 또는 code가 비어있습니다.");
      return;
    }
    const url = `${BASE_URL}/coin/assign`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        showResultBox(data);
      } else {
        showResultBox(data);
      }
    } catch (err) {
      showResultBox(err.message);
    }
  }

  // 6) JSX 렌더
  return (
    <div className={styles.pageContainer}>
      <div className={styles.coinContainer}>
        <h1 className={styles.title}>코인 시스템 테스트</h1>

        {/* [1] Username 입력 */}
        <div className={styles.inputField}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            className={styles.formControl}
            type="text"
            placeholder="예: Alice"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* [2] 버튼들 (잔액 + 사용내역 조회 / 코인 추가하기) */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className={styles.localButton} onClick={handleCheckBalance}>
            잔액 + 사용내역 조회
          </button>
          <button className={styles.localButton} onClick={handleShowCouponInput}>
            코인 추가하기
          </button>
        </div>

        {/* [3] 쿠폰 입력 영역 (showCouponInput === true 일 때만 보이기) */}
        {showCouponInput && (
          <div className={styles.couponContainer} style={{ display: "block" }}>
            <div className={styles.inputField}>
              <label htmlFor="coupon-code">코드 입력:</label>
              <input
                id="coupon-code"
                className={styles.formControl}
                type="text"
                placeholder="예: CODE123"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <button className={styles.localButton} onClick={handleAssignCode}>
              코드 사용(코인 지급)
            </button>
          </div>
        )}

        <div className={styles.sectionSeparator} />

        {/* [4] 결과 표시 영역 */}
        <h3 className={styles.subtitle}>결과</h3>
        <pre
          className={styles.resultBox}
          style={{ display: showResult ? "block" : "none" }}
        >
          {result}
        </pre>
      </div>
    </div>
  );
}
