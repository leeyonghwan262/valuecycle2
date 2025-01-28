// copywritingController.js

// 기존에 있던
// const User = require('../models/User');   // <-- 제거: 더 이상 필요 없음
// const checkCoin = (needed) => ...         // <-- 제거: 별도 checkCoin.js를 사용하는 경우

/*******************************************
 * 1) 기능혜택의미 라우트
 *******************************************/
// 기존 함수 이름 유지
exports.generateBenefitsMeaning = [
  // (1) 외부에서 checkCoin(5) 미들웨어를 라우트에서 적용한다고 가정
  //     예: route.js에서:
  //     router.post('/api/generate-benefits-meaning', checkCoin(5), generateBenefitsMeaning);

  // (2) 실제 핸들러(컨트롤러)
  async (req, res) => {
    // body에서 필요한 값 추출
    const { keyword, category, gender, age, purpose, feature1, feature2, feature3 } = req.body;

    // username 체크, 코인 차감은 이미 checkCoin(5)에서 처리된다고 가정
    // 여기서는 OpenAI 로직에 집중

    // 만약 username이 필요하다면, route + checkCoin 미들웨어가 미리 검증
    // 아래는 기존 필드들만 간단 체크
    if (!keyword || !category || !gender || !age || !purpose || !feature1 || !feature2 || !feature3) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    try {
      // openai 인스턴스 (req.openai 등으로 받아온다고 가정, or require('openai') if needed)
      // 예시:
      const openai = req.openai;
      if (!openai) {
        return res.status(500).json({ error: 'OpenAI 인스턴스가 없습니다.' });
      }

      const finalPrompt = `"
      
절대 주의사항:
- 어떤 상황에서도 ‘*’와 ‘#’ 문자를 사용하지 않는다.

각 문장에 소비자에게 말하는 듯한 대화체를 사용하세요.
입력된 정보들을 바탕으로, 제품의 기능에서 시작해, 소비자에게 주는 혜택과 의미부여를 적으세요.

사용자의 실제 생활 속 장면과 감정을 구체적으로 묘사해주세요.
한 번 읽었을 때 머릿속에 상황이 그려지고, “이거 참 좋다!”라는 느낌이 들도록 작성해주세요.


      [입력 정보]

  키워드: ${keyword}
  상위 카테고리: ${category}
  성별: ${gender}
  연령대: ${age}
  용도: ${purpose}
  기능1: ${feature1}
  기능2: ${feature2}
  기능3: ${feature3}

  이 제품은 ${keyword}가 속한 ${category} 분야에서 자주 겪는 불편함을 개선하고, 간편하고 기분 좋은 경험을 제공합니다.

  [답변양식]

- 기능X: ... (라서)

  (1번)
  - ... (그래서)
  - ... (의미부여)

  (2번)
  - ... (그래서)
  - ... (의미부여)

  (3번)
  - ... (그래서)
  - ... (의미부여)
  `;

      const completion = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages: [
          {
            role: "system",
            content: `You are a creative copywriting assistant.`
          },
          {
            role: "user",
            content: finalPrompt,
          }
        ],
      });

      console.log(completion.data);

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error("No response for benefits-meaning");
        return res.status(500).json({ error: 'Invalid response from OpenAI.' });
      }

      console.log("Benefits-meaning raw response:", content);

      // 이하 파싱 로직은 기존 그대로
      const featureRegex = /^기능(\d+):/;      
      const benefitRegex = /^- 라서\s*(.*)/;   
      const meaningRegex = /^- 의미부여\s*(.*)/; 

      const lines = content
        .split('\n')
        .map(line => line.replace(/^[\s\#\*]+/, '').trim())
        .filter(l => l);

      let currentFeature = null;
      let featuresArr = [];
      let currentItems = [];
      let lastBenefit = null;

      for (let line of lines) {
        const featureMatch = line.match(featureRegex);
        if (featureMatch) {
          // 이전 feature가 있었다면 push
          if (currentFeature !== null) {
            featuresArr.push({
              name: currentFeature,
              items: currentItems,
            });
            currentItems = [];
          }
          currentFeature = `기능${featureMatch[1].trim()}`;
          continue;
        }

        const benefitMatch = line.match(benefitRegex);
        if (benefitMatch) {
          lastBenefit = benefitMatch[1].trim();
          continue;
        }

        const meaningMatch = line.match(meaningRegex);
        if (meaningMatch) {
          const meaningText = meaningMatch[1].trim();
          if (lastBenefit) {
            currentItems.push({ benefit: lastBenefit, meaning: meaningText });
            lastBenefit = null;
          }
          continue;
        }
      }

      // 마지막 feature 처리
      if (currentFeature) {
        featuresArr.push({
          name: currentFeature,
          items: currentItems,
        });
      }

      console.log("Parsed features:", JSON.stringify(featuresArr, null, 2));

      // 최종 응답
      return res.json({ result: featuresArr });

    } catch (error) {
      console.error("DEBUG error (FULL):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error("DEBUG error.response:", error.response ? error.response.data : "no response data");
      return res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
    }
  }
];

/*******************************************
 * 2) 카피라이팅 생성 라우트
 *******************************************/
exports.generateCopywriting = [
  // (1) 별도 checkCoin(5) 미들웨어 (외부 파일)에서 username/코인 검사
  async (req, res, next) => {
    // 혹은 이 자리에 checkCoin(5) import해서 바로 사용
    // ...
    next();
  },

  // (2) 실제 핸들러
  async (req, res) => {
    // ...
    // username DB조회, 코인 차감은 checkCoin 미들웨어에서 이미 처리
    // 이 함수는 OpenAI 로직만 담당
    const { keyword, category, gender, age, purpose, selectedItems } = req.body;
    const openai = req.openai;
    // ...
  }
];
