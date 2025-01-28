// app/layout.js
import './global.css';  // 전역 CSS 임포트
import Link from 'next/link';

export const metadata = {
  title: '세컨드리치',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header>
          <div className="logo">
            <Link href="/">세컨드리치</Link>
          </div>
          <nav>
            <ul>
              <li>
                <Link href="/about">세컨드리치 소개</Link>
              </li>
              <li>
                <Link href="/ai">벨류헌터AI</Link>
              </li>
              <li>
                <Link href="/store-lecture">무료 스토어 강의</Link>
              </li>
              <li>
                <Link href="/marketing-lecture">무료 마케팅 강의</Link>
              </li>
            </ul>
          </nav>
          <button className="login-btn">로그인</button>
        </header>

        <main>{children}</main>

        <footer>&copy; 2025 세컨드리치. All rights reserved.</footer>
      </body>
    </html>
  );
}
