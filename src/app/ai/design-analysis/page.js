// app/ai/design-analysis/page.js
import DesignAnalysisClient from './designanalysisclient'; // 실제 로직을 가진 Client 컴포넌트

export const metadata = {
  title: '디자인 분석 AI 버전 1.0',
  description: '디자인 분석 페이지',
};

// Server Component
export default function DesignAnalysisPage() {
  // 여기서는 useState, useEffect 등 브라우저 훅을 쓸 수 없음
  // 대신 SSR, 데이터 fetching 등을 수행할 수 있음(필요하면)
  return (
    <main>
      <DesignAnalysisClient />
    </main>
  );
}
