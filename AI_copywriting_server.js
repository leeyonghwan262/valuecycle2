const path = require('path');  
const { config } = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const cors = require('cors');

config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = process.env.PORT || 8003;

if (!process.env.OPENAI_API_KEY) {
  console.error("API 키가 설정되지 않았습니다.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});


app.post('/api/generate-benefits-meaning', async (req, res) => {
  const { keyword, category, gender, age, purpose, feature1, feature2, feature3 } = req.body;

  if (!keyword || !category || !gender || !age || !purpose || !feature1 || !feature2 || !feature3) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

try {
  const { keyword, category, gender, age, purpose, feature1, feature2, feature3 } = req.body;


  const finalPrompt = `
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

요청:
1) 기능1, 기능2, 기능3 각각에 대해, 아래 형식을 사용해주세요:
   - 기능X: ... (라서)
     - ... (그래서)
     - ... (의미부여)
     - ... (그래서)
     - ... (의미부여)
     - ... (그래서)
     - ... (의미부여)
2) 각 기능마다 “라서/그래서/의미부여”를 꼭 3회씩 포함하십시오.
3) 사용자의 실제 생활 속 장면과 감정을 구체적으로 묘사해주세요.
4) 한 번 읽었을 때 머릿속에 상황이 그려지고, “이거 참 좋다!”라는 느낌이 들도록 작성해주세요.
`;

  const completion = await openai.chat.completions.create({
    model: "chatgpt-4o-latest",
    messages: [
      {
        role: "system",
        content: `You are a professional copywriter specializing in e-commerce product copywriting.
Please adhere to the guidelines below:
1. Do not use any Markdown syntax (#, ##, **, etc.) under any circumstances.
2. Maintain a conversational tone and incorporate storytelling to help the reader visualize vivid scenes.
3. The words “라서”, “그래서”, and “의미부여” must be included exactly three times for each 기능.
4. When analyzing 기능, distinguish between immediate benefits to the consumer and long-term 의미 (aspects that evoke emotional changes).
5. Failure to follow the format will be considered an incorrect answer.

Send in English.

Read the user message below and write three 혜택/의미 pairs for each of “기능1/2/3.”`
      },
      {
        role: "user",
        content: finalPrompt
      }
    ]
  });

  console.log(completion.data);

  const content = completion.data.choices[0]?.message?.content;
  if (!content) {
    console.error("No response for benefits-meaning");
    return res.status(500).json({ error: 'Invalid response from OpenAI.' });
  }

  console.log("Benefits-meaning raw response:", content);


  const lines = content
    .split('\n')
    .map(line => line.replace(/^[\s\#\*]+/, '').trim())
    .filter(l => l);

  let currentFeature = null;
  let featuresArr = [];
  let currentItems = [];
  let lastBenefit = null;


  for (let line of lines) {
    let featureMatch = line.match(featureRegex);
    if (featureMatch) {

      if (currentFeature !== null) {
        featuresArr.push({
          name: currentFeature,
          items: currentItems,
        });
        currentItems = [];
      }
      currentFeature = featureMatch[1].trim();
      continue;
    }

    let benefitMatch = line.match(benefitRegex);
    if (benefitMatch) {
      lastBenefit = benefitMatch[1].trim();
      continue;
    }

    let meaningMatch = line.match(meaningRegex);
    if (meaningMatch) {
      const meaningText = meaningMatch[1].trim();
      if (lastBenefit) {
        currentItems.push({ benefit: lastBenefit, meaning: meaningText });
        lastBenefit = null;
      }
      continue;
    }
  }

  if (currentFeature) {
    featuresArr.push({
      name: currentFeature,
      items: currentItems,
    });
  }

  console.log("Parsed features:", JSON.stringify(featuresArr, null, 2));
  return res.json({ features: featuresArr });

} catch (error) {
  console.error("Benefits-meaning error:", error);
  return res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
}
});

app.post('/api/generate-copywriting', async (req, res) => {
  const { keyword, category, gender, age, purpose, selectedItems } = req.body;

  if (!keyword || !category || !gender || !age || !purpose || !selectedItems || selectedItems.length === 0) {
    return res.status(400).json({ error: '필수 정보 및 선택된 혜택/의미가 없습니다.' });
  }

  console.log("Selected items for copywriting:", JSON.stringify(selectedItems,null,2));

  let featuresText = '';
  if (selectedItems && selectedItems.length > 0) {
    const featureMap = {};
    for (const item of selectedItems) {
      if (!featureMap[item.featureName]) {
        featureMap[item.featureName] = [];
      }
      featureMap[item.featureName].push({ benefit: item.benefit, meaning: item.meaning });
    }

    for (const fName in featureMap) {
      const chosen = featureMap[fName][0];
      featuresText += `\n[${fName}] 혜택: ${chosen.benefit}\n의미: ${chosen.meaning}\n`;
    }
  }

  const prompt = `
[제품 정보]
- 키워드: ${keyword}
- 상위 카테고리: ${category}
- 성별: ${gender}
- 연령대: ${age}
- 용도: ${purpose}

[선택된 혜택/의미(기능별 1개씩)]
${featuresText}

[톤앤매너 설정]
- 제품 특성과 대상 고객에 맞춰 톤을 선택하거나 혼합해 사용.
- 예) 편안/발랄, 진중/고급, 전문/격려, 모던/심플 등
- 톤 선택 이유를 스토리텔링에 반영해, 소비자가 제품을 사용하는 실제 상황에서 자연스럽게 느껴지도록 해주세요.

[기본 요구사항]
1) 각 기능(선택된 혜택/의미)마다 5쌍(3단헤드라인+카피라이팅)을 작성:
   기능명:
   3단헤드라인1: ...
   카피라이팅1: ...
   ...
   3단헤드라인5: ...
   카피라이팅5: ...

   - 모든 기능에 대해 동일하게 5쌍씩 제시
   - '**', '##', '-' 등 마크다운 문법 사용 금지
   - 형식 어기면 재작성

2) 3단헤드라인은 짧고 강렬하게, "문제/의외성 → 호기심 → 혜택" 순서로 독자의 시선을 붙잡기.

3) 카피라이팅은 약 100자 내외:
   - 톤에 맞춰 실제 상황·감정·가치 전달
   - 스토리텔링은 유지하되, 톤을 일관성 있게

4) 헤드라인과 카피라이팅은 하나의 장면이나 가치 변화를 보여주되, 톤과 키워드를 일관성 있게 유지

[요약]
- 톤앤매너 명확히 (아이템·타겟에 맞게 무게감 조정 가능)
- 3단헤드라인(문제/의외성→호기심→혜택), 짧고 강렬
- 카피 ~100자, 감정·상황·가치 전달
- 기능별 5쌍 제시

이제 위 요구사항에 맞춰, 각 기능과 혜택/의미를 적절한 톤으로 반영한 카피라이팅을 제시해주세요.
`;

try {
  const completion = await openai.chat.completions.create({
    model: "chatgpt-4o-latest",
    messages: [
      {
        role: "system",
        content: `
You are an e-commerce professional copywriter. Adhere to the following rules:
1. Do not use any Markdown syntax (e.g., '**', '##', '-').
2. Provide 3단헤드라인 and 카피라이팅 pairs as requested (5 pairs per 기능).
3. 3단헤드라인 should be concise yet attention-grabbing: 문제/의외성 → 호기심 → 혜택.
4. 카피라이팅 (around 100 characters) should reflect the chosen tone (friendly, premium, expert, or a mix) and deliver emotional or practical value.
5. Maintain consistency in style across 헤드라인 and 카피라이팅. If the format is broken, it is considered an incorrect answer.
`
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

    let content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("No AI response for copywriting");
      return res.status(500).json({ error: 'Invalid response from OpenAI.' });
    }

    // '명' 제거
    content = content
    .replace(/#{1,6}/g, "")  // ##, ###, ###### 등 제거
    .replace(/\*+/g, "")     // **, *** 제거 
    .replace(/```+/g, "");   // ``` 제거

    res.json({ copywriting: content });

    console.log("Copywriting raw content:", content);
    console.log("Final copywriting content:", content); 

    const headlineRegex = /^3단헤드라인(\d+):\s*(.*)/;
    const copywritingRegex = /^카피라이팅(\d+):\s*(.*)/;
    const featureTitleRegex = /^기능(?:\s?\w*)?:\s*(.*)/;

    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    let currentFeatureName = null;
    let currentPairs = [];
    const featuresData = [];

    for (let line of lines) {
      const ftMatch = line.match(featureTitleRegex);
      if (ftMatch) {
        if (currentFeatureName && currentPairs.length > 0) {
          featuresData.push({ name: currentFeatureName, pairs: currentPairs });
          currentPairs = [];
        }
        currentFeatureName = ftMatch[1].trim();
        continue;
      }

      const hMatch = line.match(headlineRegex);
      if (hMatch) {
        const idx = parseInt(hMatch[1]);
        currentPairs[idx - 1] = currentPairs[idx - 1] || {};
        currentPairs[idx - 1].headline = hMatch[2].trim();
        continue;
      }

      const cMatch = line.match(copywritingRegex);
      if (cMatch) {
        const idx = parseInt(cMatch[1]);
        currentPairs[idx - 1] = currentPairs[idx - 1] || {};
        currentPairs[idx - 1].copy = cMatch[2].trim();
        continue;
      }
    }

    if (currentFeatureName && currentPairs.length > 0) {
      featuresData.push({ name: currentFeatureName, pairs: currentPairs });
    }

    console.log("Parsed copywriting data:", JSON.stringify(featuresData,null,2));

    return res.json({ copywriting: featuresData });

  } catch (error) {
    console.error("Copywriting error:", error);
    return res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
