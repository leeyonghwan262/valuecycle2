document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username"); // <input id="username" />
    const gender = document.getElementById("target-gender");
    const age    = document.getElementById("target-age");
    const item   = document.getElementById("item");
    const trend  = document.getElementById("trend");

    const answerElement = document.getElementById('answer');
    const clearButton = document.getElementById('clear-button');
    const askButton = document.getElementById('ask-button');
    const answerContainer = document.getElementById('answer-container');
    const imageContainer = document.getElementById('image-container');
    const questionContainer = document.getElementById('question-container');
    const exampleContainer = document.getElementById('example');
    const headline = document.querySelector('h1');
    const loadingVideoContainer = document.getElementById('loading-video-container');
    const topContainer = document.querySelector('.top-container');

    const consumerTextInput = document.getElementById('consumer-text');
    const categoryTextInput = document.getElementById('category-text');

    if (askButton && answerElement) {
        askButton.addEventListener("click", askQuestion);

        async function askQuestion() {
            console.log("[클라이언트] askQuestion() 호출됨. 버튼 클릭!");

            // 1) 사용자 이름 체크
            const usernameValue = usernameInput ? usernameInput.value.trim() : '';
            if (!usernameValue) {
                alert("사용자 이름(username)을 입력해주세요!");
                return;
            }

            // 2) 성별/연령대/아이템/트렌드로 question 생성
            const genderValue = gender.value.trim();
            const ageValue    = age.value.trim();
            const itemValue   = item.value.trim();
            const trendValue  = trend.value.trim();
            const question = `${genderValue} ${ageValue} ${itemValue} ${trendValue}`;

            const consumerText = consumerTextInput ? consumerTextInput.value.trim() : '';
            const categoryText = categoryTextInput ? categoryTextInput.value.trim() : '';

            if (!question) {
                alert("성별, 연령대, 아이템, 트렌드 중 하나가 비어 있습니다.");
                return;
            }

            // 3) 로딩 UI 표시
            console.log("[클라이언트] 로딩화면 표시");
            if (loadingVideoContainer) {
                loadingVideoContainer.style.display = 'block';
                loadingVideoContainer.style.backgroundColor = 'transparent';
                loadingVideoContainer.style.padding = '0';
            }
            if (topContainer) topContainer.style.display = 'none';
            if (headline) headline.style.display = 'none';
            if (askButton) askButton.style.display = 'none';

            answerElement.style.display = 'none';
            clearButton.style.display = 'none';
            imageContainer.style.display = 'none';

            // 4) 기존 프롬프트 (절대 수정 금지)
            const additionalText = `
            소비자의 벨류해킹을 완료하였습니다. 이제 소비자의 구매욕구를 설명해 드리겠습니다.
            무조건 '한국어'로 답변해줘. 공손하게 말해줘.
            답변의 형식은 다음과 같습니다:
            1. 첫 번째 이유:
            2. 두 번째 이유:
            3. 세 번째 이유:
            4. 네 번째 이유:
            5. 다섯 번째 이유:

            소비자 관점: ${consumerText}
            상위 카테고리: ${categoryText}
            
            각 항목의 제목은 내용의 핵심을 간단하게 요약하여 작성해줘.
            전체적으로 소비자의 심리적인 부분과 구매욕구, 그런 욕구를 가지게 된 배경을 자세하게 풀어서 설명해줘.
            첫 번째로, 이 제품을 사용하는 배경과 이유를 소비자의 입장에서 설명해줘.
            두 번째로, 소비자가 이 제품을 구매할 수밖에 없는 이유와 상황들을 알려줘.
            세 번째로, 소비자가 이 제품을 구매함으로써 느낄 수 있는 만족감을 설명해줘.
            네 번째로, 소비자가 이 제품을 사용하는 상황과 분위기를 알려줘.
            다섯 번째로, 소비자가 이 제품을 구매함으로써 얻는 이득이 무엇인지 알려줘.
            `;
            const fullQuestion = `${question}\n\n${additionalText}`;
            answerElement.innerText = '소비자의 구매욕구 벨류해킹 중입니다...';

            // 5) 서버 요청
            try {
                console.log("[클라이언트] /analyze-consumer 요청 전송...");
                const response = await fetch('https://value-hunter.net/analyze-consumer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: usernameValue,
                        question: fullQuestion
                    }),
                });

                console.log("[클라이언트] 응답 status:", response.status);

                // (A) 코인 부족 => 403
                if (response.status === 403) {
                    alert("코인이 부족합니다! (403)");
                    // 로딩 끄고 UI 복원
                    loadingVideoContainer.style.display = 'none';
                    if (headline) headline.style.display = 'block';
                    if (askButton) askButton.style.display = 'block';
                    return;
                }

                // (B) 기타 에러 => not ok
                if (!response.ok) {
                    const errData = await response.json();
                    alert(`에러: ${errData.error || '서버 문제'}`);
                    loadingVideoContainer.style.display = 'none';
                    if (headline) headline.style.display = 'block';
                    if (askButton) askButton.style.display = 'block';
                    return;
                }

                // (C) 성공 => 응답 JSON
                const data = await response.json();
                console.log("[클라이언트] 서버 응답 data:", data);

                const answerFromServer = data.result;
                if (!answerFromServer) {
                    alert("결과(result)가 없습니다.");
                    // 로딩 끄기
                    loadingVideoContainer.style.display = 'none';
                    if (headline) headline.style.display = 'block';
                    if (askButton) askButton.style.display = 'block';
                    return;
                }

                // 6) 응답 표시
                let formattedAnswer = answerFromServer.replace(
                  /(\d+\.\s+[^:\n]+:)/g,
                  '<br><br><span style="color: #02fe85; font-weight: bold;">$1</span>'
                );
                answerElement.innerHTML = formattedAnswer;

                // 로딩 끄고 UI 표시
                loadingVideoContainer.style.display = 'none';
                answerContainer.style.display = 'block';
                clearButton.style.display = 'block';
                answerElement.style.display = 'block';
                scrollToAnswer();

            } catch (error) {
                console.error('[클라이언트] Error 발생:', error);
                alert("요청 처리 중 오류가 발생했습니다.");
                loadingVideoContainer.style.display = 'none';
                // UI 복원
                if (headline) headline.style.display = 'block';
                if (askButton) askButton.style.display = 'block';
            }
        }

        // 스크롤
        function scrollToAnswer() {
            if (answerContainer) {
                answerContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // 초기화 버튼
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            if (answerElement) answerElement.innerHTML = '';
            if (consumerTextInput) consumerTextInput.value = '';
            if (categoryTextInput) categoryTextInput.value = '';

            if (answerContainer) answerContainer.style.display = 'none';
            if (clearButton) clearButton.style.display = 'none';
            if (imageContainer) imageContainer.style.display = 'none';

            if (topContainer) topContainer.style.display = 'flex';
            if (headline) headline.style.display = 'block';
            if (askButton) askButton.style.display = 'block';
        });
    }
});
