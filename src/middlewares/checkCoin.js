// src/middlewares/checkCoin.js
const db = require('../config/db.js');

/**
 * checkCoin(cost) 미들웨어
 * - username이 req.body에 있어야 함
 * - user.coin_balance >= cost 이면 차감 + history 기록
 * - 부족하면 403
 */
module.exports = (cost = 1) => {
  return (req, res, next) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'username이 필요합니다.' });
    }

    // 1) user 조회
    const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    if (!user) {
      return res.status(404).json({ error: '해당 사용자가 존재하지 않습니다.' });
    }

    // 2) 코인 부족
    if (user.coin_balance < cost) {
      return res.status(403).json({
        error: `코인이 부족합니다. (필요: ${cost}, 현재: ${user.coin_balance})`
      });
    }

    // 3) 코인 차감
    db.prepare(`
      UPDATE users
      SET coin_balance = coin_balance - ?,
          spent_coins  = spent_coins + ?
      WHERE id = ?
    `).run(cost, cost, user.id);

    // 4) history 테이블에 사용 내역 기록
    db.prepare(`
      INSERT INTO history (user_id, cost, reason)
      VALUES (?, ?, ?)
    `).run(user.id, cost, 'USE');

    // 완료
    next();
  };
};
