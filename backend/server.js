import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001; // 프론트엔드(5173)와 다른 포트 사용

app.use(cors()); // CORS 허용 (다른 포트에서의 요청)
app.use(express.json()); // JSON 요청 본문 파싱

// --- 목업(Mock) 데이터 ---
const mockTechnicians = [
  { id: 1, name: '홍길동', role: '특급', status: '재직' },
  { id: 2, name: '김철수', role: '고급', status: '재직' },
  { id: 3, name: '이영희', role: '중급', status: '퇴사' },
  { id: 4, name: '박기술', role: '초급', status: '재직' },
];

const mockTechDetail = {
    id: 1,
    name: '홍길동 (상세)',
    role: '특급',
    status: '재직',
    management: { field: '토목', grade: '특급' },
    licenses: [
        { name: '토목시공기술사', date: '2010-03-01', number: '10-12345' },
        { name: '건설안전기술사', date: '2015-05-20', number: '15-67890' },
    ]
    // ... (13개 탭의 모든 상세 데이터)...
};

// --- API 엔드포인트 정의 ---

// GET /api/technicians (기술인 목록)
app.get('/api/technicians', (req, res) => {
  console.log('GET /api/technicians 요청 받음');
  res.json(mockTechnicians);
});

// GET /api/technicians/:id (기술인 상세)
app.get('/api/technicians/:id', (req, res) => {
  const { id } = req.params;
  console.log(`GET /api/technicians/${id} 요청 받음`);
  // 실제 DB에서는 id로 조회하겠지만, 여기서는 목업 데이터를 보냄
  res.json({ ...mockTechDetail, id: parseInt(id) });
});

// POST /api/excel/upload (엑셀 업로드 - 예시)
// (실제 구현 시: multer, xlsx 라이브러리 필요)
app.post('/api/excel/upload', (req, res) => {
    console.log('POST /api/excel/upload 요청 받음');
    // 1. multer로 파일 수신
    // 2. xlsx로 파일 파싱
    // 3. N/1 중복일수 계산 등 비즈니스 로직 처리
    // 4. DB에 저장
    res.status(200).json({ message: '엑셀 업로드 성공 (시뮬레이션)' });
});

// --- 서버 시작 ---
app.listen(port, () => {
  console.log(`백엔드 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});