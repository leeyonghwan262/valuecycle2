// design_analysis.js

document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById('image-input');
  const analyzeButton = document.getElementById('analyze-button');
  const resultContainer = document.getElementById('result-container');
  const resultDesc = document.getElementById('result-desc');

  // (A) 업로드 폼과 프리뷰 컨테이너, 프리뷰 이미지 엘리먼트 참조
  const uploadForm = document.getElementById('upload-form');
  const loadingVideoContainer = document.getElementById('loading-video-container');
  const previewContainer = document.getElementById('preview-container');
  const previewImage = document.getElementById('preview-image');

  const consumerText = document.getElementById('consumer-text');
  const categoryText1 = document.getElementById('category-text-1');
  const categoryText2 = document.getElementById('category-text-2');
  const categoryText3 = document.getElementById('category-text-3');

  // username 필드
  const usernameInput = document.getElementById('username');

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  function displayResult(message) {
    if (resultDesc) {
      resultDesc.textContent = message;
      resultContainer.style.display = 'block';
    } else {
      console.error("결과 영역(result-desc)을 찾을 수 없습니다.");
    }
  }

  async function analyzeImage() {
    // 여기서 실제 파일 객체를 가져옴
    const file = imageInput.files[0];
    if (!file) {
      displayResult("분석할 이미지를 선택해주세요.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      displayResult("이미지 파일 크기가 5MB를 초과합니다. 5MB 이하 파일만 업로드해주세요.");
      return;
    }

    // 업로드 폼 숨기고, 로딩 표시
    uploadForm.style.display = 'none';
    loadingVideoContainer.style.display = 'block';

    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = 'none'; 

    // 추가로 폼에 있는 텍스트 값들
    const consumerValue = consumerText ? consumerText.value.trim() : "";
    const categoryValue1 = categoryText1 ? categoryText1.value.trim() : "";
    const categoryValue2 = categoryText2 ? categoryText2.value.trim() : "";
    const categoryValue3 = categoryText3 ? categoryText3.value.trim() : "";
    const usernameValue  = usernameInput ? usernameInput.value.trim() : "";

    if (!usernameValue) {
      displayResult("username을 입력해 주세요.");
      loadingVideoContainer.style.display = 'none';
      uploadForm.style.display = 'block';
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('consumerText', consumerValue);
    formData.append('categoryText1', categoryValue1);
    formData.append('categoryText2', categoryValue2);
    formData.append('categoryText3', categoryValue3);
    formData.append('username', usernameValue);

    try {
      const response = await fetch('http://localhost:3000/analyze-design', {
        method: 'POST',
        body: formData
      });
      
      // ★ 403 상태라면, 코인이 부족하다는 알림을 띄우고 로직 중단
      if (response.status === 403) {
        alert("코인이 부족합니다.");
        
        // 로딩화면 끄고 업로드 폼 다시 보여주기
        loadingVideoContainer.style.display = 'none';
        uploadForm.style.display = 'block';
        return;
      }

      // 다른 에러 상태 체크
      if (!response.ok) {
        throw new Error(`이미지 분석 서버 응답에 문제가 있습니다. (상태 코드: ${response.status})`);
      }

      // 성공 응답 처리
      loadingVideoContainer.style.display = 'none';
      const data = await response.json();

      if (data && data.result) {
        displayResult(data.result);
      } else if (data.error) {
        displayResult(`에러: ${data.error}`);
      } else {
        displayResult("이미지 분석 결과를 가져올 수 없습니다.");
      }

      // 프리뷰 이미지 보여주기
      previewContainer.style.display = 'block';
      previewImage.src = URL.createObjectURL(file);

    } catch (error) {
      console.error('Error:', error);
      displayResult(`에러: ${error.message}`);
      
      // 429 등 다른 특정 상태코드 체크 예시
      if (error.message.includes('429')) {
        displayResult("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      }

      // 로딩화면 끄고 업로드 폼 다시 보이기
      loadingVideoContainer.style.display = 'none';
      uploadForm.style.display = 'block';
    }
  }

  if (analyzeButton && imageInput) {
    analyzeButton.addEventListener("click", analyzeImage);
  } else {
    console.error("analyze-button 또는 image-input 요소를 찾을 수 없습니다.");
  }
});
