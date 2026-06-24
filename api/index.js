import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();

app.use(cors()); // CORS 활성화
app.use(express.json());

// MySQL 데이터베이스 연결 정보 설정
const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// 1. 문제 가져오기 API
app.get('/api/questions', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // 1. 문제 정보와 카테고리명을 조인하여 가져옴
        const [questions] = await connection.query(`
            SELECT q.id, q.year, q.question_number, q.question_text, q.correct_answer, c.name AS subject_name 
            FROM exam_questions q 
            LEFT JOIN exam_categories c ON q.category_id = c.id
        `);
        
        // 2. 보기 정보들을 가져옴
        const [options] = await connection.query(`
            SELECT question_id, option_number, option_text 
            FROM exam_options 
            ORDER BY question_id, option_number
        `);
        
        await connection.end();

        // 3. 문제별 보기 그룹화 맵 생성 { [question_id]: ["보기1", "보기2", ...] }
        const optionsMap = {};
        options.forEach(opt => {
            if (!optionsMap[opt.question_id]) {
                optionsMap[opt.question_id] = [];
            }
            optionsMap[opt.question_id][opt.option_number - 1] = opt.option_text;
        });

        // 4. React 컴포넌트가 요구하는 포맷으로 포맷팅
        const formattedQuestions = questions.map(q => ({
            id: String(q.id),
            year: q.year,
            subject: q.subject_name || "미분류",
            no: q.question_number,
            question: q.question_text,
            options: optionsMap[q.id] || [],
            answer: q.correct_answer,
            explanation: "해당 기출문제의 상세 해설은 준비 중입니다."
        }));

        res.json(formattedQuestions);
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ error: "데이터베이스 조회 실패" });
    }
});

// Vercel Serverless Function으로 동작하기 위해 Express app 인스턴스 반환
export default app;
