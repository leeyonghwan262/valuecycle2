// src/routes/coin.js
const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const checkCoin = require('../middlewares/checkCoin.js');

/* 1) GET /coin/balance?username=xxx */
router.get('/balance', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({
      error: 'username이 필요합니다.(?username=xxx)'
    });
  }

  // 유저 찾기
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({
      error: '존재하지 않는 유저'
    });
  }

  // history 불러오기 (최신 10건 예시)
  const historyRows = db.prepare(`
    SELECT cost, reason, created_at
    FROM history
    WHERE user_id=?
    ORDER BY created_at DESC
    LIMIT 10
  `).all(user.id);

  // 응답
  return res.json({
    username: user.username,
    coin_balance: user.coin_balance,
    history: historyRows // 프론트에서 이 배열을 출력
  });
});

/* 2) POST /coin/charge 
   Body: { username, amount } 
   코인 충전 + history 기록
*/
router.post('/charge', (req, res) => {
  const { username, amount } = req.body;
  if (!username || amount === undefined) {
    return res.status(400).json({ error: 'username, amount 모두 필요합니다.' });
  }

  const amt = parseInt(amount, 10);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'amount는 1 이상의 정수여야 합니다.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  // 코인 충전
  const newBalance = user.coin_balance + amt;
  db.prepare('UPDATE users SET coin_balance=? WHERE id=?')
    .run(newBalance, user.id);

  // history 기록 (cost=amt, reason='CHARGE')
  db.prepare(`
    INSERT INTO history (user_id, cost, reason)
    VALUES (?, ?, 'CHARGE')
  `).run(user.id, amt);

  return res.json({
    message: `코인 ${amt}개 충전 완료`,
    coin_balance: newBalance
  });
});

/* 3) POST /coin/use
   Body: { username, cost }
   checkCoin(cost) 미들웨어로 코인 차감 + history 기록
   => 여기선 추가 로직(예: "상품 구매")만 처리
*/
router.post('/use', (req, res, next) => {
  const cost = parseInt(req.body.cost || '1', 10);

  // checkCoin이 끝나면 코인은 이미 차감 + history 기록
  checkCoin(cost)(req, res, () => {
    // 다시 user 조회 (차감 후 잔액 조회)
    const user = db.prepare('SELECT * FROM users WHERE username=?').get(req.body.username);

    // 여기에서 "상품구매" 등 추가 로직을 실행 가능
    return res.json({
      message: `코인 ${cost}개 사용 완료(미들웨어에서 차감됨).`,
      remain_coins: user.coin_balance
    });
  });
});

/* 4) POST /coin/assign 
   코드 사용 => 코인 지급 + history
*/
router.post('/assign', (req, res) => {
  const { username, code } = req.body;
  if (!username || !code) {
    return res.status(400).json({ error: 'username, code 모두 필요합니다.' });
  }

  const codeRow = db.prepare('SELECT * FROM auth_codes WHERE code=?').get(code);
  if (!codeRow) {
    return res.status(400).json({ error: `존재하지 않는 코드: ${code}` });
  }
  if (codeRow.is_used === 1) {
    return res.status(400).json({ error: `이미 사용된 코드: ${code}` });
  }

  const reward = codeRow.initial_coins;
  let user = db.prepare('SELECT * FROM users WHERE username=?').get(username);

  if (!user) {
    // 유저 없으면 새로 생성
    db.prepare('INSERT INTO users (username, coin_balance) VALUES (?, ?)')
      .run(username, reward);
    user = { username, coin_balance: reward };
    // user.id는 없으므로 다시 get
    const insertedUser = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    user.id = insertedUser.id;
  } else {
    const updatedBalance = user.coin_balance + reward;
    db.prepare('UPDATE users SET coin_balance=? WHERE id=?')
      .run(updatedBalance, user.id);
    user.coin_balance = updatedBalance;
  }

  // auth_codes.is_used=1
  db.prepare('UPDATE auth_codes SET is_used=1 WHERE id=?')
    .run(codeRow.id);

  // history 기록 (cost=reward, reason='ASSIGN')
  db.prepare(`
    INSERT INTO history (user_id, cost, reason)
    VALUES (?, ?, 'ASSIGN')
  `).run(user.id, reward);

  return res.json({
    message: `코드 ${code} -> ${reward}코인 지급 완료.`,
    username: user.username,
    coin_balance: user.coin_balance
  });
});

module.exports = router;
