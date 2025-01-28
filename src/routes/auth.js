// src/routes/coin.js

const express = require('express');
const router = express.Router();
const db = require('../config/db.js');  // ../config/db.js 상대경로 주의

//--------------------------------------
// 1) 코인 잔액 조회
// GET /coin/balance?username=xxx 또는 POST /coin/balance { username: ... }
router.get('/balance', (req, res) => {
  // 여기서는 예시로 querystring에서 username 받기
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'username이 필요합니다.(query: ?username=xxx)' });
  }

  // DB에서 유저 찾기
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  return res.json({ username: user.username, coin_balance: user.coin_balance });
});

//--------------------------------------
// 2) 코인 충전
// POST /coin/charge  body: { username, amount }
router.post('/charge', (req, res) => {
  const { username, amount } = req.body;
  if (!username || !amount) {
    return res.status(400).json({ error: 'username, amount 모두 필요합니다.' });
  }

  // 정수인지/양수인지 확인 (간단히)
  const chargeAmount = parseInt(amount, 10);
  if (isNaN(chargeAmount) || chargeAmount <= 0) {
    return res.status(400).json({ error: 'amount는 1 이상의 정수여야 합니다.' });
  }

  // DB에서 유저 찾기
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  // 코인 충전
  db.prepare('UPDATE users SET coin_balance = coin_balance + ? WHERE id=?')
    .run(chargeAmount, user.id);

  const newBalance = user.coin_balance + chargeAmount;

  return res.json({
    message: `코인 ${chargeAmount}개 충전 완료`,
    coin_balance: newBalance,
  });
});

//--------------------------------------
// 3) 코인 사용(차감) 예시
// POST /coin/use  body: { username, cost }
router.post('/use', (req, res) => {
  const { username, cost } = req.body;
  if (!username || !cost) {
    return res.status(400).json({ error: 'username, cost 모두 필요합니다.' });
  }

  const useAmount = parseInt(cost, 10);
  if (isNaN(useAmount) || useAmount <= 0) {
    return res.status(400).json({ error: 'cost는 1 이상의 정수여야 합니다.' });
  }

  // DB에서 유저 찾기
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  // 코인 부족 확인
  if (user.coin_balance < useAmount) {
    return res.status(400).json({
      error: `코인이 부족합니다. (현재 ${user.coin_balance}, 필요한 ${useAmount})`,
    });
  }

  // 차감
  db.prepare('UPDATE users SET coin_balance = coin_balance - ? WHERE id=?')
    .run(useAmount, user.id);

  return res.json({
    message: `코인 ${useAmount}개 사용 완료`,
    remain_coins: user.coin_balance - useAmount,
  });
});

module.exports = router;
