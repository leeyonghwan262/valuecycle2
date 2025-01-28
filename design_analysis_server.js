// server.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = 8002;

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(process.cwd(), 'public')));

// 루트("/") 접근 시 index.html 전송
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.post('/analyze-design', (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: '폼 데이터를 파싱하는 중 에러가 발생했습니다.' });
      }

      const consumerText = fields.consumerText || '';
      const categoryText1 = fields.categoryText1 || '';
      const categoryText2 = fields.categoryText2 || '';

      if (!files.image) {
        return res.status(400).json({ error: '이미지 파일이 존재하지 않습니다.' });
      }

      // ↓ 수정된 부분 ↓
      console.log("Selected file:", files.image);

      const uploadedFile = Array.isArray(files.image)
      ? files.image[0]     // 여러 개일 경우 첫 번째 파일
      : files.image;       // 단일 객체라면 그대로 사용

      const imagePath = uploadedFile.filepath; 
      
      const fileData = fs.readFileSync(imagePath);
      const base64Image = fileData.toString('base64');

      const requestBody = {
        model: 'chatgpt-4o-latest',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `이미지를 분석해줘.
소비자 정보: ${consumerText}
카테고리1: ${categoryText1}
카테고리2: ${categoryText2}
`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'auto'
                }
              }
            ],
          },
        ],
        max_tokens: 300,
      };

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

      const openaiData = await openaiResponse.json();

      if (
        openaiData &&
        openaiData.choices &&
        openaiData.choices.length > 0 &&
        openaiData.choices[0].message
      ) {
        const analysisResult = openaiData.choices[0].message.content || '분석 결과가 없습니다.';
        return res.json({
          success: true,
          analysis: analysisResult.trim(),
        });
      } else {
        return res.json({
          success: false,
          analysis: '이미지 분석 결과를 가져올 수 없습니다.',
        });
      }
    } catch (error) {
      console.error('Error in analyze-design:', error);
      return res.status(500).json({
        error: '서버 내부 오류가 발생했습니다.',
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
