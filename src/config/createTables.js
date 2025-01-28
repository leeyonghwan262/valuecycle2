// src/config/createTables.js

const path = require('path');
const db = require('../db.js'); 
// ^^^ 주의: 상대 경로 '../db.js' 
//    => 올라가서(src/) + db.js

// 이 스크립트는 (선택) "테스트용" 유저를 추가하는 용도.
// 이미 db.js가 테이블+auth_codes 삽입을 한다면, 여긴 꼭 필요 없을 수도 있습니다.

// 1) 테스트용 유저 Insert
//    (password='testpass', coin_balance=100)
db.exec(`
  INSERT OR IGNORE INTO users (username, password, coin_balance)
  VALUES ('testuser', 'testpass', 100)
`);

// 2) 콘솔 메시지
console.log('테이블 및 기본 데이터가 준비되었습니다!(createTables)');

// 3) 종료 (선택적으로)
process.exit();
