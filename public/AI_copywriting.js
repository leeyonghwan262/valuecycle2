document.addEventListener("DOMContentLoaded", () => {
    // (1) username 입력 필드 추가 (예: id="username")
    // 실제 HTML에 <input type="text" id="username" /> 등이 있어야 합니다.
    const usernameInput = document.getElementById('username');

    const keywordInput = document.getElementById('keywords');
    const categoryInput = document.getElementById('category');
    const genderInput = document.getElementById('gender');
    const ageInput = document.getElementById('age');
    const feature1Input = document.getElementById('feature-1');
    const feature2Input = document.getElementById('feature-2');
    const feature3Input = document.getElementById('feature-3');
    const purposeInput = document.getElementById('purpose');
    const answerElement = document.getElementById('answerElement');
    const askButton = document.getElementById('generate-benefits-btn');
    const loadingVideoContainer = document.getElementById('loading-video-container');
    const loadingVideo = document.getElementById('loading-video');
    const topContainer = document.querySelector('#top-container');
    let answerContainer = document.getElementById('answer-container');
    const copywritingBtn = document.getElementById('generate-copywriting-btn');
    const copywritingResult = document.getElementById('copywriting-result');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const globalRegenerateContainer = document.getElementById('global-regenerate-container');
    const copywritingContainer = document.getElementById('copywriting-container');

    let lastSelectedItems = null;  
    let lastRequestData = null;

    let globalRegenerateCopywritingContainer = document.getElementById('global-regenerate-copywriting-container');
    if (!globalRegenerateCopywritingContainer) {
        globalRegenerateCopywritingContainer = document.createElement('div');
        globalRegenerateCopywritingContainer.id = 'global-regenerate-copywriting-container';
        document.body.appendChild(globalRegenerateCopywritingContainer);
    }

    if (askButton) {
        askButton.addEventListener("click", () => {
            // (2) username 필수 체크
            const username = usernameInput.value.trim();
            if (!username) {
                alert("사용자 이름(username)을 입력해주세요.");
                return;
            }

            const keyword = keywordInput.value.trim();
            const category = categoryInput.value.trim();
            const gender = genderInput.value.trim();
            const age = ageInput.value.trim();
            const feature1 = feature1Input.value.trim();
            const feature2 = feature2Input.value.trim();
            const feature3 = feature3Input.value.trim();
            const purpose = purposeInput.value.trim();

            if (!keyword || !category || !gender || !age || !purpose || !feature1 || !feature2 || !feature3) {
                alert("모든 필드를 채워주세요.");
                return;
            }

            lastRequestData = { username, keyword, category, gender, age, purpose, feature1, feature2, feature3 };
            requestBenefitsMeaning(lastRequestData);
        });
    }

    if (regenerateBtn) {
        regenerateBtn.addEventListener("click", () => {
            if (lastRequestData) {
                requestBenefitsMeaning(lastRequestData);
            }
        });
    }

    if (copywritingBtn) {
        copywritingBtn.addEventListener("click", () => {
            // (2) username 필수 체크
            const username = usernameInput.value.trim();
            if (!username) {
                alert("사용자 이름(username)을 입력해주세요.");
                return;
            }

            const checkboxes = document.querySelectorAll('.pair-select:checked');
            if (checkboxes.length === 0) {
                alert("카피라이팅 생성을 위해 하나 이상 선택해주세요.");
                return;
            }

            const selectedByFeature = {};
            checkboxes.forEach(cb => {
                const featName = cb.dataset.feature;
                if (!selectedByFeature[featName]) selectedByFeature[featName] = 0;
                selectedByFeature[featName]++;
            });

            const featuresSelectedCount = Object.keys(selectedByFeature).length;
            if (featuresSelectedCount !== 3) {
                alert("기능마다 1개씩 총 3개를 선택해주세요.");
                return;
            }

            for (let featName in selectedByFeature) {
                if (selectedByFeature[featName] !== 1) {
                    alert("각 기능당 하나씩만 선택해주세요.");
                    return;
                }
            }

            const selectedItems = [];
            checkboxes.forEach(cb => {
                selectedItems.push({
                    featureName: cb.dataset.feature,
                    benefit: cb.dataset.benefit,
                    meaning: cb.dataset.meaning
                });
            });

            lastSelectedItems = selectedItems; 

            const keyword = keywordInput.value.trim();
            const category = categoryInput.value.trim();
            const gender = genderInput.value.trim();
            const age = ageInput.value.trim();
            const purpose = purposeInput.value.trim();

            setLoadingState(true);

            if (answerContainer) answerContainer.style.display = 'none';

            // (3) username도 함께 서버로 전달
            fetch('https://value-hunter.net/api/generate-copywriting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username, 
                    keyword, 
                    category, 
                    gender, 
                    age, 
                    purpose, 
                    selectedItems 
                })
            })
            .then(async res => {
                if (res.status === 403) {
                    const errorData = await res.json();
                    alert("코인이 부족합니다.");
                    throw new Error('Forbidden: 코인이 부족합니다.');
                }
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                copywritingContainer.style.display = 'block';
                displayCopywriting(data.result);  // ← 최종 응답 { result: ... }
                regenerateBtn.style.display = 'none';
                globalRegenerateContainer.style.display = 'none';
                createCopywritingRegenerateButton();
            })
            .catch(err => {
                if (err.message.includes('Forbidden')) {
                    // 이미 alert를 표시했으므로 추가 작업이 필요없을 수 있습니다.
                    console.error("코인이 부족하여 요청을 중단했습니다.");
                } else {
                    console.error("카피라이팅 생성 중 오류:", err);
                    alert("카피라이팅 생성 중 오류가 발생했습니다.");
                }
            })
            .finally(() => setLoadingState(false));
        });
    }

    function createCopywritingRegenerateButton() {
        globalRegenerateCopywritingContainer.innerHTML = '';
        globalRegenerateCopywritingContainer.style.display = 'block';
        globalRegenerateCopywritingContainer.style.top = '20px';
        globalRegenerateCopywritingContainer.style.right = '20px';

        const button = document.createElement('button');
        button.textContent = '카피라이팅 재생성';
        button.addEventListener('click', () => {
            if (!lastSelectedItems || !lastRequestData) {
                alert("재생성할 데이터가 없습니다.");
                return;
            }
            setLoadingState(true);
            fetch('https://value-hunter.net/api/generate-copywriting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  username: lastRequestData.username, // 마지막에 사용했던 username
                  keyword: lastRequestData.keyword,
                  category: lastRequestData.category,
                  gender: lastRequestData.gender,
                  age: lastRequestData.age,
                  purpose: lastRequestData.purpose,
                  selectedItems: lastSelectedItems 
                })
            })
            .then(async res => {
                if (res.status === 403) {
                    const errorData = await res.json();
                    alert("코인이 부족합니다.");
                    throw new Error('Forbidden: 코인이 부족합니다.');
                }
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                copywritingContainer.style.display = 'block';
                displayCopywriting(data.result);  // ← 최종 응답 { result: ... }
            })
            .catch(err => {
                if (err.message.includes('Forbidden')) {
                    console.error("코인이 부족하여 재생성을 중단했습니다.");
                } else {
                    console.error("카피라이팅 재생성 중 오류:", err);
                    alert("카피라이팅 재생성 중 오류가 발생했습니다.");
                }
            })
            .finally(() => setLoadingState(false));
        });

        globalRegenerateCopywritingContainer.appendChild(button);
    }

    function requestBenefitsMeaning({ username, keyword, category, gender, age, purpose, feature1, feature2, feature3 }) {
        setLoadingState(true);

        fetch('https://value-hunter.net/api/generate-benefits-meaning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, keyword, category, gender, age, purpose, feature1, feature2, feature3 })
        })
        .then(async res => {
            if (res.status === 403) {
                const errorData = await res.json();
                alert("코인이 부족합니다.");
                throw new Error('Forbidden: 코인이 부족합니다.');
            }
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            displayFeatures(data.result);  // ← 최종 응답 { result: ... } 내 features
            regenerateBtn.style.display = 'block';
            globalRegenerateContainer.style.display = 'block';
        })
        .catch(err => {
            if (err.message.includes('Forbidden')) {
                console.error("코인이 부족하여 요청을 중단했습니다.");
            } else {
                console.error("서버 요청 중 오류 발생:", err);
                alert("결과를 가져오는 중 오류가 발생했습니다.");
            }
        })
        .finally(() => setLoadingState(false));
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            if (loadingVideo) {
                loadingVideo.pause();             
                loadingVideo.currentTime = 0;    
                loadingVideo.play();             
            }
            if (topContainer) topContainer.style.display = 'none';
            if (copywritingContainer) copywritingContainer.style.display = 'none';
            if (globalRegenerateContainer) globalRegenerateContainer.style.display = 'none';
            if (loadingVideoContainer) loadingVideoContainer.style.display = 'flex';
            if (answerContainer) answerContainer.style.display = 'none';
        } else {
            if (topContainer) topContainer.style.display = 'none';
            if (loadingVideoContainer) loadingVideoContainer.style.display = 'none';
            if (answerContainer) answerContainer.style.display = 'block';
        }
    }

    function displayFeatures(features) {
        answerElement.innerHTML = '';
        copywritingResult.innerHTML = '';
        copywritingContainer.style.display = 'none';

        if (!features || features.length === 0) {
            answerElement.innerHTML = '<p>기능/혜택/의미 데이터가 없습니다.</p>';
        } else {
            features.forEach((f, i) => {
                const block = document.createElement('div');
                block.classList.add('feature-block');

                const title = document.createElement('h3');
                title.textContent = f.name;
                block.appendChild(title);

                const itemsToShow = f.items.slice(0,3); 
                itemsToShow.forEach((item, index) => {
                    const pairBlock = document.createElement('div');
                    pairBlock.classList.add('benefit-meaning-block');

                    // 선택 문구 위에 2번 엔터
                    pairBlock.appendChild(document.createElement('br'));
                    pairBlock.appendChild(document.createElement('br'));

                    const checkboxWrapper = document.createElement('span');
                    checkboxWrapper.classList.add('checkbox-label');

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('pair-select');
                    checkbox.dataset.feature = 'func' + i; 
                    checkbox.dataset.benefit = item.benefit;
                    checkbox.dataset.meaning = item.meaning;

                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            const allCheckboxes = document.querySelectorAll('.pair-select');
                            allCheckboxes.forEach(cb => {
                                if (cb !== checkbox && cb.dataset.feature === checkbox.dataset.feature) {
                                    cb.checked = false;
                                }
                            });
                        }
                    });

                    const selectLabel = document.createTextNode('[선택]');
                    checkboxWrapper.appendChild(checkbox);
                    checkboxWrapper.appendChild(selectLabel);

                    pairBlock.appendChild(checkboxWrapper);

                    // 혜택, 의미 단어만 민트색으로 표시하기 위해 span 추가
                    const benefitLine = document.createElement('div');
                    benefitLine.innerHTML = `<span class="mint-label">혜택:</span> ${item.benefit}`;
                    benefitLine.style.marginLeft = '20px';
                    pairBlock.appendChild(benefitLine);

                    const meaningLine = document.createElement('div');
                    meaningLine.innerHTML = `<span class="mint-label">의미:</span> ${item.meaning}`;
                    meaningLine.style.marginLeft = '20px';
                    pairBlock.appendChild(meaningLine);

                    block.appendChild(pairBlock);
                });

                answerElement.appendChild(block);
            });
        }

        if (answerContainer) answerContainer.style.display = 'block';
    }

    function displayCopywriting(content) {
        copywritingResult.innerHTML = '';
        if (!content) {
            copywritingResult.innerHTML = '카피라이팅 결과가 없습니다.';
            return;
        }

        // 원본 코드에서 '명' 제거 로직
        let rawContent = JSON.stringify(content).replace(/명/g, '');
        // JSON.stringify 때문에 남는 "" 등은 단순화 처리
        rawContent = rawContent.replace(/^"|"$/g, '');

        // 실제 content는 배열 구조로 가정(featuresData)
        // 여기서는 그대로 content를 사용
        const featuresData = content;

        const allFeaturesContainer = document.createElement('div');
        allFeaturesContainer.classList.add('all-features-container');
        allFeaturesContainer.style.border = 'none';

        featuresData.forEach((feature, fIndex) => {
            const featureBlock = document.createElement('div');
            featureBlock.classList.add('copywriting-feature-block');
            featureBlock.style.border = 'none';

            const h3 = document.createElement('h3');
            h3.textContent = feature.name;
            h3.style.color = '#02fe85';
            h3.style.fontSize = '2em';
            h3.style.marginBottom = '20px';
            featureBlock.appendChild(h3);

            const pairsContainer = document.createElement('div');
            pairsContainer.style.border = 'none';

            for (let i = 0; i < 5; i++) {
                const p = feature.pairs[i];
                if (!p) continue;

                // 3단헤드라인 부분 (기존 방식)
                const headlineDiv = document.createElement('div');
                headlineDiv.innerHTML = `<span class="mint-label">3단헤드라인${i+1}:</span><br> - ${p.headline || ''}`;
                pairsContainer.appendChild(headlineDiv);

                // 카피라이팅 부분 (기존 로직에 줄바꿈 방식)
                const words = p.copy ? p.copy.split(' ') : [];
                let lineBuffer = '';
                const maxLength = 15; 
                let wrappedLines = [];

                words.forEach(word => {
                    if ((lineBuffer + ' ' + word).trim().length > maxLength) {
                        if (lineBuffer) wrappedLines.push(lineBuffer.trim());
                        lineBuffer = word;
                    } else {
                        lineBuffer += ' ' + word;
                    }
                });
                if (lineBuffer.trim()) wrappedLines.push(lineBuffer.trim());

                const wrappedText = wrappedLines.map(line => '  ' + line).join('<br>');

                const copyDiv = document.createElement('div');
                copyDiv.innerHTML = `<span class="mint-label">카피라이팅${i+1}:</span><br>${wrappedText}`;
                pairsContainer.appendChild(copyDiv);

                pairsContainer.appendChild(document.createElement('br'));
            }

            featureBlock.appendChild(pairsContainer);
            allFeaturesContainer.appendChild(featureBlock);
        });

        copywritingResult.appendChild(allFeaturesContainer);
        copywritingContainer.style.display = 'block';

        if (answerContainer) {
            answerContainer.remove();
            answerContainer = null;
        }
    }
});
