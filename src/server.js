// server.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const axios = require('axios');

// (A) .env 명시적 로드 (경로 확인)
console.log('CWD:', process.cwd());

// 예: .env 파일이 프로젝트 루트(/home/ec2-user/valuecycle/.env)에 있다고 가정
// 만약 src/ 내부에 .env가 있다면, 그 경로에 맞춰 조정
const envPath = path.join(__dirname, '..', '.env');

// 디버그용 존재 확인
if (!fs.existsSync(envPath)) {
  console.warn('Warning: .env file not found at:', envPath);
}

require('dotenv').config({
  path: envPath
});

console.log('Check OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Found' : 'Missing');

// ------------------------------------------
// (B) 필요한 모듈들
const coinRouter = require('./routes/coin.js');
const router = require('./routes/route.js');

// 1) 앱 생성
const app = express();

// 2) CORS 설정
// 원활한 Preflight 처리를 위해 methods, allowedHeaders도 명시
// credentials 필요한 경우 true로 설정
const corsOptions = {
  origin: [
    'https://secondrich.imweb.me',
    'https://value-hunter.net'
  ],
  methods: ['GET','POST','OPTIONS','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // 일부 브라우저 호환용
};

// 전역 CORS 미들웨어
app.use(cors(corsOptions));

// Preflight OPTIONS 처리
app.options('*', cors(corsOptions));

// parse json / urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일
app.use(express.static(path.join(process.cwd(), 'public')));

// 3) OpenAI 설정
if (!process.env.OPENAI_API_KEY) {
  console.error('No API Key found in environment. Exiting...');
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use((req, res, next) => {
  req.openai = openai;
  next();
});

// 4) 코인 라우터
app.use('/coin', coinRouter);

// 5) 기존 라우트.js
app.use('/', router);

// 6) 추가 (app.js에서 하던 엔드포인트들)
//   예) /generate-prompt, /generate-image
app.post('/generate-prompt', async (req, res) => {
  const { keyword } = req.body;
  // 여기서 실제 OpenAI 호출 로직 구현 (예시)
  // ...
  return res.json({ answer: '아직 미구현' });
});

app.post('/generate-image', async (req, res) => {
  const { keyword } = req.body;
  // 여기서 실제 OpenAI DALL-E 호출 로직 구현
  // ...
  return res.json({ imageUrl: '아직 미구현' });
});

// 7) 리스닝
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`서버 running on port ${port}`);
});
