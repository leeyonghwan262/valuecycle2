// controllers.js
const db = require('../config/db.js');
const bcrypt = require('bcrypt'); // 비밀번호 해시용(간단히만 사용)

// 1) 회원가입 + 고유 코드 입력
exports.registerWithCode = (req, res) => {
  const { username, password, code } = req.body;
  if (!username || !password || !code) {
    return res.status(400).json({ error: 'username, password, code 모두 필요합니다.' });
  }

  // 1. auth_codes에서 code 찾기
  const findCode = db.prepare('SELECT * FROM auth_codes WHERE code = ?').get(code);
  if (!findCode) {
    return res.status(400).json({ error: '고유 코드가 존재하지 않습니다.' });
  }
  if (findCode.is_used === 1) {
    return res.status(400).json({ error: '이미 사용된 코드입니다.' });
  }

  // 2. 사용자 생성
  // 비밀번호 해시(간단히 10라운드)
  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare(`
      INSERT INTO users (username, password, coin_balance)
      VALUES (?, ?, ?)
    `).run(username, hash, findCode.initial_coins);
  } catch (e) {
    if (e.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: '이미 존재하는 username입니다.' });
    }
    return res.status(500).json({ error: e.message });
  }

  // 3. auth_codes.is_used = 1 업데이트
  db.prepare('UPDATE auth_codes SET is_used = 1 WHERE id = ?').run(findCode.id);

  return res.json({ message: '가입 성공!', coin_balance: findCode.initial_coins });
};

// 2) 로그인
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username, password 필요' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(400).json({ error: '존재하지 않는 유저' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '비밀번호 불일치' });
  }

  // (간단히 세션 없이 user ID 반환 or JWT 발행)
  return res.json({ message: '로그인 성공', coin_balance: user.coin_balance });
};

// 3) 코인이 필요한 기능(예: AI분석) 요청 시 코인 차감
exports.aiAnalysis = (req, res) => {
  const { username } = req.body; 
  if (!username) return res.status(400).json({ error: 'username 필요' });

  // 1. DB에서 user 확인
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(400).json({ error: '유저 없음' });

  // 예: 분석 10코인 차감
  const cost = 10;
  if (user.coin_balance < cost) {
    return res.status(400).json({ error: '코인 부족' });
  }

  // 2. 코인 차감
  db.prepare('UPDATE users SET coin_balance = coin_balance - ? WHERE id = ?')
    .run(cost, user.id);

  // 3. 결과 응답(실제로는 AI API 호출 로직이 들어갈 수 있음)
  return res.json({ message: `AI 분석 완료! ${cost}코인 소모`, remain_coins: user.coin_balance - cost });
};
