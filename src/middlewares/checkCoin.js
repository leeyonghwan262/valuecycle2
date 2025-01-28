// src/middlewares/checkCoin.js

const db = require('../config/db.js');

/**
 * @param {number} cost - 기능 사용할 때 소모할 코인 수 (기본값 1)
 * 사용 예: router.post('/analysis', checkCoin(5), analysisFn);
 */
module.exports = (cost = 1) => {
  return (req, res, next) => {
    // 1) 요청 Body에서 username 받기
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'username이 필요합니다.' });
    }

    // 2) DB에서 해당 username 사용자 조회
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(404).json({ error: '해당 사용자가 존재하지 않습니다.' });
    }

    // 3) 코인 잔액 >= cost 확인
    if (user.coin_balance < cost) {
      return res.status(403).json({ 
        error: `코인이 부족합니다. (필요: ${cost}, 현재: ${user.coin_balance})`
      });
    }

    // 4) 코인 차감 + 소모 코인(spent_coins) 증가
    //    coin_balance -= cost, spent_coins += cost
    db.prepare(`
      UPDATE users
      SET coin_balance = coin_balance - ?,
          spent_coins  = spent_coins + ?
      WHERE id = ?
    `).run(cost, cost, user.id);

    // 차감 후 컨트롤러로 넘어가기
    next();
  };
};
