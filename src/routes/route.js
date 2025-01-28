// route.js

const express = require('express');
const path = require('path');
const router = express.Router();

// 미들웨어 import
const checkCoin = require('../middlewares/checkCoin.js');

// 컨트롤러 import
const { analyzeConsumer } = require('../controllers/consumerController');
const { analyzeDesign } = require('../controllers/designController');
const { generateBenefitsMeaning, generateCopywriting } = require('../controllers/copywritingController');
const { registerWithCode, login, aiAnalysis } = require('../controllers/controllers.js');

// 1) GET /
router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

/* ============================
   2) 소비자 분석 (POST /analyze-consumer)
      => (A) 사용자 ID(=username) 필수
      => (B) 코인 5 소모 (checkCoin(5))
============================ */
router.post(
  '/analyze-consumer',
  (req, res, next) => {
    if (!req.body.username) {
      return res.status(400).json({ error: '소비자 분석을 위해 username이 필요합니다.' });
    }
    next();
  },
  checkCoin(5),    // 여기서 코인 부족 시 403으로 처리
  analyzeConsumer
);

/* ============================
   3) 디자인 분석 (POST /analyze-design)
      => 코인 5 소모
============================ */
router.post(
  '/analyze-design',
  checkCoin(5),    // 여기서 코인 부족 시 403
  analyzeDesign
);

/* ============================
   4) 카피라이팅 (POST /api/generate-copywriting)
      => 코인 5 소모
============================ */
router.post(
  '/api/generate-copywriting',
  checkCoin(5),    // 코인 부족 시 403
  generateCopywriting
);

// =====================
// 다른 라우트들
// =====================

// 5) 회원가입 + 고유코드
router.post('/register', registerWithCode);

// 6) 로그인
router.post('/login', login);

// 7) AI분석(코인 차감) -> '/analyze' 등
router.post('/analyze', aiAnalysis);

// 마무리
module.exports = router;
