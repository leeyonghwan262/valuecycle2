const forbiddenWords = ["챗gpt", "챗지피티", "프롬프트", "프롬프터", "명령어"];

function containsForbiddenWords(input) {
  return forbiddenWords.some(word => input.toLowerCase().includes(word));
}

exports.analyzeConsumer = async (req, res) => {
  console.log('소비자 인사이트 분석 요청이 들어왔습니다.');

  // 1) username과 question을 Body에서 받음
  const { username, question } = req.body;

  // 2) 사용자 이름 체크
  if (!username) {
    return res.status(400).json({ result: '사용자 이름(username)이 필요합니다.' });
  }

  // 3) question 체크
  if (!question) {
    return res.status(400).json({ result: '모든 필드를 입력하세요. (question 누락)' });
  }

  // 4) 금지어 검사
  if (containsForbiddenWords(question)) {
    return res.status(400).json({ result: '금지된 단어가 포함되어 있습니다.' });
  }

  // 5) OpenAI API 호출
  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const additionalText = `
      소비자의 벨류해킹을 완료하였습니다. 이제 소비자의 구매욕구를 설명해 드리겠습니다.
      무조건 '한국어'로 답변해줘. 공손하게 말해줘.
      답변의 형식은 다음과 같습니다:
      1. 첫 번째 이유:
      2. 두 번째 이유:
      3. 세 번째 이유:
      4. 네 번째 이유:
      5. 다섯 번째 이유:

      각 항목의 제목은 내용의 핵심을 간단하게 요약하여 작성해줘.
      전체적으로 소비자의 심리적인 부분과 구매욕구, 그런 욕구를 가지게 된 배경을 자세하게 풀어서 설명해줘.
      첫 번째로, 이 제품을 사용하는 배경과 이유를 소비자의 입장에서 설명해줘.
      두 번째로, 소비자가 이 제품을 구매할 수밖에 없는 이유와 상황들을 알려줘.
      세 번째로, 소비자가 이 제품을 구매함으로써 느낄 수 있는 만족감을 설명해줘.
      네 번째로, 소비자가 이 제품을 사용하는 상황과 분위기를 알려줘.
      다섯 번째로, 소비자가 이 제품을 구매함으로써 얻는 이득이 무엇인지 알려줘.
    `;

    const fullQuestion = `${question}\n\n${additionalText}`;

    const openAiResponse = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages: [{ role: 'user', content: fullQuestion }],
      max_tokens: 1500,
      temperature: 0.5,
      n: 1,
    });

    const responseText = openAiResponse.choices[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error('OpenAI 응답이 유효하지 않습니다.');
    }

    // 6) 응답 전송 (result 필드로 답변)
    //    username은 미들웨어(checkCoin)에서 코인 차감했을 것이므로, 여기선 별도 로직 필요X
    res.send({ result: responseText });

  } catch (error) {
    console.error('OpenAI API 요청 중 오류 발생:', error.response ? error.response.data : error.message);
    res.status(500).json({ result: 'OpenAI API 요청 중 오류가 발생했습니다.' });
  }
};
