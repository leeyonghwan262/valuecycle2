// coin코드 (coin.js)
const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

/*  
  1) GET /coin/balance?username=xxx 
     - 잔액 조회
*/
router.get('/balance', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'username이 필요합니다.(query: ?username=xxx)' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  return res.json({
    username: user.username,
    coin_balance: user.coin_balance
  });
});

/*  
  2) POST /coin/charge
     Body: { "username": "Alice", "amount": 50 } 
     - 코인을 추가(충전)
*/
router.post('/charge', (req, res) => {
  const { username, amount } = req.body;
  if (!username || amount === undefined) {
    return res.status(400).json({ error: 'username, amount 모두 필요합니다.' });
  }

  const chargeAmount = parseInt(amount, 10);
  if (isNaN(chargeAmount) || chargeAmount <= 0) {
    return res.status(400).json({ error: 'amount는 1 이상의 정수여야 합니다.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  const newBalance = user.coin_balance + chargeAmount;
  db.prepare('UPDATE users SET coin_balance=? WHERE id=?').run(newBalance, user.id);

  return res.json({
    message: `코인 ${chargeAmount}개 충전 완료`,
    coin_balance: newBalance
  });
});

/*  
  3) POST /coin/use
     Body: { "username": "Alice", "cost": 20 }
     - 코인을 차감(사용)
*/
router.post('/use', (req, res) => {
  const { username, cost } = req.body;
  if (!username || cost === undefined) {
    return res.status(400).json({ error: 'username, cost 모두 필요합니다.' });
  }

  const useAmount = parseInt(cost, 10);
  if (isNaN(useAmount) || useAmount <= 0) {
    return res.status(400).json({ error: 'cost는 1 이상의 정수여야 합니다.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    return res.status(404).json({ error: '존재하지 않는 유저' });
  }

  // ★ 403 상태코드로 "코인이 부족합니다" 표시
  if (user.coin_balance < useAmount) {
    return res.status(403).json({
      error: `코인이 부족합니다. (현재 ${user.coin_balance}, 필요한 ${useAmount})`
    });
  }

  const newBalance = user.coin_balance - useAmount;
  db.prepare('UPDATE users SET coin_balance=? WHERE id=?').run(newBalance, user.id);

  return res.json({
    message: `코인 ${useAmount}개 사용 완료`,
    remain_coins: newBalance
  });
});

/*  
  4) POST /coin/assign
     Body: { "username": "Alice", "code": "CODE123" }
     => auth_codes 테이블에서 code 확인, is_used=0이면 coin_balance += initial_coins
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
    db.prepare(`
      INSERT INTO users (username, coin_balance)
      VALUES (?, ?)
    `).run(username, reward);

    user = { username, coin_balance: reward };
  } else {
    const updatedBalance = user.coin_balance + reward;
    db.prepare('UPDATE users SET coin_balance=? WHERE id=?').run(updatedBalance, user.id);
    user.coin_balance = updatedBalance;
  }

  db.prepare('UPDATE auth_codes SET is_used=1 WHERE id=?').run(codeRow.id);

  return res.json({
    message: `코드 ${code}를 사용해 ${reward}코인을 지급했습니다.`,
    username: user.username,
    coin_balance: user.coin_balance
  });
});

module.exports = router;
