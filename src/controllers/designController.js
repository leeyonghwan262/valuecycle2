// designController.js
const formidable = require('formidable');
const fs = require('fs');
const fetch = require('node-fetch');

// (예시) DB 조회 & 코인 차감용
// 실제로는 모델/ORM 등에 맞춰 구현해야 합니다.
const User = {
  findOne: async ({ username }) => {
    // DB에서 사용자 조회 로직
    // 예: return await UserModel.findOne({ username });
    // 여기서는 가상의 사용자 객체를 반환하는 예시:
    if (username === 'testuser') {
      return { username: 'testuser', coin_balance: 10 }; // 코인이 10개인 가상 유저
    }
    return null; // 못 찾았을 경우
  },
  save: async (userData) => {
    // 코인 차감 등 업데이트 후 저장
    // 여기서는 단순 예시이므로 실제 동작은 생략
    return userData;
  },
};

// (예시) checkCoin(5) 미들웨어
// 실제로는 라우트 레벨에서 router.post('/...', checkCoin(5), ...) 식으로 사용 가능.
function checkCoin(requiredCoins) {
  return async function (req, res, next) {
    try {
      const username = req.fields.username; // formidable parse 후 req.fields에 들어있다고 가정
      // DB에서 사용자 조회
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: '해당 사용자를 찾을 수 없습니다.' });
      }

      // 코인 보유량 확인
      if (user.coin_balance < requiredCoins) {
        return res.status(403).json({ error: '코인이 부족합니다. (최소 5개 필요)' });
      }

      // 코인 차감 처리
      user.coin_balance -= requiredCoins;
      await User.save(user); // DB에 반영 (예시)

      // 이후 로직 진행
      next();
    } catch (err) {
      console.error('checkCoin 중 오류:', err);
      return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
    }
  };
}

exports.analyzeDesign = (req, res) => {
  // (1) Formidable 인스턴스 생성
  const form = new formidable.IncomingForm();

  // (2) form.parse로 요청 파싱
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({
          error: '폼 데이터를 파싱하는 중 에러가 발생했습니다.',
        });
      }

      // username 필드 유무 확인
      if (!fields.username) {
        return res
          .status(400)
          .json({ error: 'username 필드는 필수입니다.' });
      }

      // parse 이후, checkCoin(5) 미들웨어를 직접 호출하여 코인 처리
      req.fields = fields; // checkCoin에서 사용하기 위해 req.fields에 할당
      await new Promise((resolve, reject) => {
        checkCoin(5)(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // (3) 클라이언트에서 보낸 텍스트 필드들
      const consumerText = fields.consumerText || '';
      const categoryText1 = fields.categoryText1 || '';
      const categoryText2 = fields.categoryText2 || '';
      const categoryText3 = fields.categoryText3 || '';

      // (금지어 검사 로직이 이미 있다면 여기에서 수행 - 필요 시 추가)

      if (!files.image) {
        return res
          .status(400)
          .json({ error: '이미지 파일이 존재하지 않습니다.' });
      }

      console.log('Selected file:', files.image);

      // (4) 여러 파일이 올 수 있으므로, 단일 파일만 선택
      const uploadedFile = Array.isArray(files.image)
        ? files.image[0]
        : files.image;

      // (5) 파일 경로 & base64 변환
      const imagePath = uploadedFile.filepath; // Formidable v2.x에서 filepath 사용
      const fileData = fs.readFileSync(imagePath);
      const base64Image = fileData.toString('base64');

      // (6) OpenAI API 요청 바디
      const requestBody = {
        model: 'chatgpt-4o-latest',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `소비자 정보: ${consumerText}
카테고리1: ${categoryText1}
카테고리2: ${categoryText2}
카테고리3: ${categoryText3}

위의 4가지 정보를 바탕으로 아래 프롬프트대로 답변해주세요.

[역할 지시]
당신은 디자인 전문가이자 카피라이팅 전문가입니다. 제가 전달하는 이미지를 보고, 제품 또는 디자인 요소를 세부적으로 분석해 주세요.

[분석 지침]
1. 전체적인 디자인 개요: 
   - 첫인상으로 어떠한 분위기, 콘셉트, 느낌을 주는지 설명해 주세요.
   - 상품(또는 디자인)의 핵심 목적이나 용도가 무엇일 것 같은지 추측해 주세요.

2. 컬러감과 색상 배합:
   - 사용된 색상들과 그 조합이 주는 느낌, 분위기를 구체적으로 서술해 주세요. 
   - 각 컬러의 상징성이나 연출 효과가 있다면 함께 언급해 주세요.

3. 형태·구조·디테일:
   - 제품(또는 디자인)의 주요 형태나 패턴, 구성 요소를 단계별로 설명해 주세요.
   - 디테일한 부분(텍스처, 레이어, 장식 요소 등)이 어떤 역할을 하는지 풀어 주세요.

4. 재질 혹은 소재:
   - 확인 가능하다면, 어떤 재질 혹은 소재로 보이는지 서술해 주세요.
   - 시각적으로 드러나는 질감이 주는 효과(고급스러움, 따뜻함, 유니크함 등)를 설명해 주세요.

5. 사용 편의성 및 기능성:
   - 이 디자인이 실제로 사용될 때 어떤 이점을 줄 것 같은지, 기능적 장점을 추측해 주세요.
   - 사용자 경험(UX) 관점에서 고려할 만한 부분이 있다면 함께 다뤄 주세요.

6. 주 타깃·소비자층:
   - 이 디자인(또는 제품)을 좋아할 법한 소비자층(연령대, 취향, 라이프스타일 등)을 구체적으로 묘사해 주세요.
   - 그들이 이 디자인에 매력을 느낄 만한 요소(시각적·감성적·실용적 등)를 분석해 주세요.

7. 종합적인 평가:
   - 위 요소들을 종합해서, 전반적인 장점과 특장점, 그리고 개선이 필요한 부분이 있다면 함께 언급해 주세요.
   - 이 디자인이 전달하는 분위기, 브랜드 이미지, 스토리텔링 측면에서의 강점을 정리해 주세요.

[답변 형식]
- 답변은 문어체와 구체적인 키워드를 활용해 주세요.
- 숫자나 소제목 등을 활용해 체계적으로 정리해 주세요.
- 숫자만 작성하고 소제목은 작성 하지마세요
- 각 번호의 문장이 끝나면 줄바꿈을 2번해주세요.
- 디자인적 감상을 충분히 표현하면서도, 마케팅 측면에서 어떤 점이 매력적이고 소비자에게 어필할 수 있을지 세부적으로 설명해 주세요.
.

`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'auto',
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      };

      // (7) OpenAI API 호출
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!openaiResponse.ok) {
        return res.status(openaiResponse.status).json({
          error: `OpenAI API 에러 (상태코드: ${openaiResponse.status})`,
        });
      }

      // (8) 응답 파싱
      const openaiData = await openaiResponse.json();
      if (
        openaiData &&
        openaiData.choices &&
        openaiData.choices.length > 0 &&
        openaiData.choices[0].message
      ) {
        const analysisResult =
          openaiData.choices[0].message.content || '분석 결과가 없습니다.';
        // 최종 JSON 응답 형식을 { result: "..." }로 맞춤
        return res.json({
          result: analysisResult.trim(),
        });
      } else {
        return res.json({
          result: '이미지 분석 결과를 가져올 수 없습니다.',
        });
      }
    } catch (error) {
      console.error('Error in analyze-design:', error);
      return res.status(500).json({
        error: '서버 내부 오류가 발생했습니다.',
      });
    }
  });
};
