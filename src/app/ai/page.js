// app/page.js
import styles from './page.module.css';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.title}>벨류헌터 AI</h1>

      <div className={styles.buttonContainer}>
        <Link href="/ai/coinindex" className={styles.linkButton}>
          0단계, 벨류코인 체크&입력
        </Link>

        <Link href="/ai/consumer-analysis" className={styles.linkButton}>
          1단계, AI 소비자 분석
        </Link>

        <Link href="/ai/design-analysis" className={styles.linkButton}>
          2단계, AI 디자인분석
        </Link>

        <Link href="/ai/ai-copywriting" className={styles.linkButton}>
          3단계, AI 카피라이팅
        </Link>

        <Link href="/ai/page3" className={styles.linkButton}>
          4단계, AI 상세페이지 기획(준비중)
        </Link>

        <Link href="/ai/page4" className={styles.linkButton}>
          5단계, AI 상세페이지 첨삭(준비중)
        </Link>

        <Link href="/ai/page5" className={styles.linkButton}>
          6단계, AI 이미지화(준비중)
        </Link>
      </div>
    </div>
  );
}
