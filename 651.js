document.addEventListener("DOMContentLoaded", () => { 
    const questionInput = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const clearButton = document.getElementById('clear-button');
    const askButton = document.getElementById('ask-button'); // 버튼 요소 확인
    const answerBox = document.getElementById('answer-box');
    const imageBox = document.getElementById('image-box');
    const questionContainer = document.getElementById('question-container');
    const exampleContainer = document.getElementById('example');
    const headline = document.querySelector('h1');
    const loadingVideoContainer = document.getElementById('loading-video-container'); 

    // 버튼이 존재하는지 확인하고 이벤트 리스너 추가
    if (askButton) {
        askButton.addEventListener("click", askQuestion); // ★★★★★★★★★★★
    } else {
        console.error("askButton element not found."); // ★★★★★★★★★★★
    }

    async function askQuestion() {
        const question = questionInput.value.trim();
        if (!question) {
            alert("질문을 입력해주세요.");
            return;
        }

        // 로딩 비디오 컨테이너 표시
        if (loadingVideoContainer) {
            loadingVideoContainer.style.display = 'block'; // 요소가 있을 때만 표시
        } else {
            console.error("loading-video-container element not found.");
            return; // 요소가 없으면 함수 종료 ★★★★★★★★★★★
        }

        // 질문이 입력되면 요소 숨기기 및 배경 제거
        questionContainer.style.display = 'none';
        exampleContainer.style.display = 'none';
        headline.style.display = 'none';
        askButton.style.display = 'none';

        // 로딩 상태 설정
        answerElement.style.display = 'none';
        clearButton.style.display = 'none';
        imageBox.style.display = 'none';
        // 질문 박스와 예시 박스의 배경 제거
        questionContainer.style.backgroundColor = 'transparent';
        exampleContainer.style.backgroundColor = 'transparent';

        // Express.js 서버 설정 코드 ★★★★★★★★★★★
        const express = require('express');
        const path = require('path');
        const app = express();
        const PORT = 4000;

        // public 폴더를 정적 파일 제공 폴더로 설정 ★★★★★★★★★★★
        app.use(express.static(path.join(__dirname, 'public')));

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
});


        // 사용자 질문 + 보충 질문 결합 (보충 질문은 서버 전송용)

        const additionalText = `
        답변은 반드시 숫자로 구분해줘 그리고 한국어로 답변해줘

        각 항목의 제목은 내용의 핵심을 간단하게 요약하여 작성해줘. 제목은 자동으로 내용을 요약한 중요한 포인트로, 짧고 명확하게 작성해.
        그리고 답변은 꼭 한국어로 해줘.
        
        첫번째로,배경과 이유를 담아줘 그 제품을 사용하는 배경과 이유를 알려줘, 이때 제품의 관점이 아니라 소비자가 그것을 왜 사용하고 싶은지 소비자의 입장에서 알려줘.
        
        두 번째로,이제품을 구매하는 이유를 알려줘 소비자가 이 제품을 구매를 할 수 밖에 없는 이유와 그 상황들을 알려줘
        
        세 번째로,소비자가 이 제품을 구매함으로써 만족감이 뭔지 알려줘. 소비자가 뿌듯하고 소비를 하고나서 즐거워하는 느낌을 담아줘
        
        네 번째로, 상황과 분위기를 알려줘 소비자가 이 제품을 사용하는 상황과 이 제품을 사용하는 분위기가 어떤지 알려줘.
        
        다섯 번째로,소비자가 이 제품을 구매함으로써 얻는 이득이 무엇인지 알려줘.
        
        맨 윗부분에 '소비자들의 구매욕구를 모두 벨류해킹하였습니다.'라고 적어줘. 더 공손하게 말하고.
        `;
        
        const fullQuestion = `${question}\n\n${additionalText}`;

            // 로딩 메시지 표시
    answerElement.innerText = '소비자의 구매욕구 벨류해킹 중입니다...';
        
        try {
            const response = await fetch('https://value-hunter.net/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: fullQuestion }),
            });
            
            if (!response.ok) {
                throw new Error('서버 응답에 문제가 있습니다.');
            }

            const data = await response.json();
            let formattedAnswer = data.answer.replace(/(\d+\.\s+[^:\n]+:)/g, '<br><br><span style="color: #02fe85; font-weight: bold;">$1</span>');
            answerElement.innerHTML = formattedAnswer || '답변을 가져올 수 없습니다. 세컨드리치에게 연락주세요';

            // 로딩 영상 숨기기
            loadingVideoContainer.style.display = 'none';

            // 답변이 있으면 요소 보이기
            answerBox.style.display = 'block';
            clearButton.style.display = 'block';
            answerBox.style.backgroundColor = '#333';
            document.getElementById('image-box').style.display = 'block';

        } catch (error) {
            answerElement.innerText = '오류가 발생했습니다. 세컨드리치에게 연락주세요';
            console.error('Error:', error);

            // 로딩 영상 숨기기
            loadingVideoContainer.style.display = 'none';
            
        }
    }

    clearButton.addEventListener("click", () => {
        answerElement.innerHTML = '';
        questionInput.value = '';
        answerBox.style.display = 'none';
    });
});
