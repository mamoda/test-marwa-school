const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const path = require('path');

dotenv.config();

const database = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-app.onrender.com'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// التحقق من صحة التوكن
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'غير مصرح به' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'توكن غير صالح' });
        }
        req.user = user;
        next();
    });
};

// تهيئة قاعدة البيانات
database.initialize().then(() => {
    console.log('✅ قاعدة البيانات جاهزة');
}).catch(err => {
    console.error('❌ خطأ في قاعدة البيانات:', err);
    process.exit(1);
});

// ======================== المسارات العامة ========================

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// تسجيل الدخول
app.post('/api/auth/login', [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const user = await database.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                gradeLevel: user.grade_level,
                role: user.role
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// تسجيل مستخدم جديد
app.post('/api/auth/register', [
    body('username').isLength({ min: 3 }).withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('fullName').notEmpty().withMessage('الاسم الكامل مطلوب'),
    body('gradeLevel').isInt({ min: 1, max: 12 }).withMessage('الصف الدراسي غير صالح')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, fullName, gradeLevel } = req.body;
        
        const existingUser = await database.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
        }

        const userId = await database.createUser({
            username,
            password,
            fullName,
            gradeLevel
        });

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح',
            userId
        });
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// ======================== مسارات محمية ========================

// جلب جميع الصفوف
app.get('/api/grades', authenticateToken, async (req, res) => {
    try {
        const grades = await database.getGrades();
        res.json(grades);
    } catch (error) {
        console.error('خطأ في جلب الصفوف:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// جلب مواد الصف
app.get('/api/grades/:gradeId/subjects', authenticateToken, async (req, res) => {
    try {
        const subjects = await database.getSubjectsByGrade(req.params.gradeId);
        res.json(subjects);
    } catch (error) {
        console.error('خطأ في جلب المواد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// جلب دروس المادة
app.get('/api/subjects/:subjectId/lessons', authenticateToken, async (req, res) => {
    try {
        const lessons = await database.getLessonsBySubject(req.params.subjectId);
        res.json(lessons);
    } catch (error) {
        console.error('خطأ في جلب الدروس:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// جلب أسئلة الدرس
app.get('/api/lessons/:lessonId/questions', authenticateToken, async (req, res) => {
    try {
        const level = req.query.level || 1;
        const questions = await database.getQuestionsByLesson(req.params.lessonId, level);
        
        // إعادة ترتيب الخيارات بالصيغة المطلوبة
        const formattedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correct: q.correct_answer,
            points: q.points
        }));
        
        res.json(formattedQuestions);
    } catch (error) {
        console.error('خطأ في جلب الأسئلة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// حفظ نتيجة اختبار
app.post('/api/exam/submit', authenticateToken, async (req, res) => {
    try {
        const { lessonId, answers, score, correctAnswers, totalQuestions } = req.body;
        const userId = req.user.id;

        const attemptId = await database.saveExamAttempt({
            userId,
            lessonId,
            score,
            correctAnswers,
            totalQuestions,
            answersJson: JSON.stringify(answers)
        });

        res.json({
            message: 'تم حفظ النتيجة بنجاح',
            attemptId
        });
    } catch (error) {
        console.error('خطأ في حفظ النتيجة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// جلب تقدم الطالب
app.get('/api/student/progress', authenticateToken, async (req, res) => {
    try {
        const progress = await database.getStudentProgress(req.user.id);
        res.json(progress);
    } catch (error) {
        console.error('خطأ في جلب التقدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// جلب محاولات الطالب لدرس معين
app.get('/api/student/attempts/:lessonId', authenticateToken, async (req, res) => {
    try {
        const attempts = await database.db.all(
            `SELECT * FROM exam_attempts 
             WHERE user_id = ? AND lesson_id = ? 
             ORDER BY completed_at DESC`,
            [req.user.id, req.params.lessonId]
        );
        res.json(attempts);
    } catch (error) {
        console.error('خطأ في جلب المحاولات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});