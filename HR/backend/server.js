// [HR/backend/server.js]
import express from 'express';
import cors from 'cors';
import projectRoutes from './routes/projects.js';
const app = express();
const PORT = 5002;
app.use(cors());
app.use(express.json());
app.use('/api/projects', projectRoutes);
app.get('/', (req, res) => {
    res.send('HR Backend Server is running.');
});
app.listen(PORT, () => {
    console.log(`\n> HR 백엔드 서버가 포트 ${PORT}에서 가동을 시작합니다.`);
});