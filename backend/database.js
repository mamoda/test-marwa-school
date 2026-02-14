const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.db = null;
    }

    async initialize() {
        this.db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });

        await this.createTables();
        await this.seedData();
        console.log('✅ قاعدة البيانات متصلة وجاهزة');
        return this.db;
    }

    async createTables() {
        // جدول المستخدمين (الطلاب)
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                grade_level INTEGER NOT NULL,
                role TEXT DEFAULT 'student',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // جدول الصفوف الدراسية
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS grades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                grade_number INTEGER UNIQUE NOT NULL,
                grade_name TEXT NOT NULL,
                description TEXT
            )
        `);

        // جدول المواد الدراسية
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                grade_id INTEGER NOT NULL,
                subject_name TEXT NOT NULL,
                subject_icon TEXT,
                description TEXT,
                FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
                UNIQUE(grade_id, subject_name)
            )
        `);

        // جدول الدروس
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER NOT NULL,
                lesson_name TEXT NOT NULL,
                description TEXT,
                difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        `);

        // جدول الأسئلة
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lesson_id INTEGER NOT NULL,
                level INTEGER DEFAULT 1,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer INTEGER CHECK(correct_answer BETWEEN 0 AND 3),
                points INTEGER DEFAULT 10,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            )
        `);

        // جدول محاولات الاختبار
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS exam_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                lesson_id INTEGER NOT NULL,
                score INTEGER DEFAULT 0,
                total_questions INTEGER DEFAULT 10,
                correct_answers INTEGER DEFAULT 0,
                answers_json TEXT,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            )
        `);

        // جدول تقدم الطالب
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS student_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                lesson_id INTEGER NOT NULL,
                completed_levels INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                attempts_count INTEGER DEFAULT 0,
                last_attempt_date DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
                UNIQUE(user_id, lesson_id)
            )
        `);

        // جدول الجلسات (للتتبع)
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    }

    async seedData() {
        // التحقق من وجود بيانات مبدئية
        const gradesCount = await this.db.get('SELECT COUNT(*) as count FROM grades');
        
        if (gradesCount.count === 0) {
            console.log('🌱 جاري إضافة البيانات المبدئية...');
            
            // إضافة الصفوف
            const grades = [
                [1, 'الصف الأول الابتدائي', 'المرحلة الابتدائية - السنة الأولى'],
                [2, 'الصف الثاني الابتدائي', 'المرحلة الابتدائية - السنة الثانية'],
                [3, 'الصف الثالث الابتدائي', 'المرحلة الابتدائية - السنة الثالثة'],
                [4, 'الصف الرابع الابتدائي', 'المرحلة الابتدائية - السنة الرابعة']
            ];
            
            for (const [number, name, desc] of grades) {
                await this.db.run(
                    'INSERT INTO grades (grade_number, grade_name, description) VALUES (?, ?, ?)',
                    [number, name, desc]
                );
            }
            
            // إضافة المواد للصف الأول
            const grade1 = await this.db.get('SELECT id FROM grades WHERE grade_number = 1');
            
            const subjects = [
                [grade1.id, 'اللغة العربية', 'fa-language', 'قواعد اللغة العربية وأدبها'],
                [grade1.id, 'الرياضيات', 'fa-calculator', 'العمليات الحسابية الأساسية'],
                [grade1.id, 'العلوم', 'fa-flask', 'مبادئ العلوم والطبيعة']
            ];
            
            for (const [gradeId, name, icon, desc] of subjects) {
                await this.db.run(
                    'INSERT INTO subjects (grade_id, subject_name, subject_icon, description) VALUES (?, ?, ?, ?)',
                    [gradeId, name, icon, desc]
                );
            }
            
            // إضافة الدروس للغة العربية
            const arabicSubject = await this.db.get(
                'SELECT id FROM subjects WHERE subject_name = ? AND grade_id = ?',
                ['اللغة العربية', grade1.id]
            );
            
            const lessons = [
                [arabicSubject.id, 'المدخل إلى النحو', 'أساسيات النحو العربي', 'easy', 1],
                [arabicSubject.id, 'الأسماء الموصولة', 'تعلم الأسماء الموصولة واستخداماتها', 'medium', 2],
                [arabicSubject.id, 'الأفعال وأزمنتها', 'تصريف الأفعال وأنواعها', 'hard', 3]
            ];
            
            for (const [subjectId, name, desc, diff, order] of lessons) {
                await this.db.run(
                    'INSERT INTO lessons (subject_id, lesson_name, description, difficulty, order_index) VALUES (?, ?, ?, ?, ?)',
                    [subjectId, name, desc, diff, order]
                );
            }
            
            // إضافة الأسئلة للدرس الأول
            const firstLesson = await this.db.get('SELECT id FROM lessons WHERE lesson_name = ?', ['المدخل إلى النحو']);
            
            const questions = [
                [firstLesson.id, 1, 'ما نوع الجمع في كلمة "مُعَلِّمُونَ"؟', 'جمع مؤنث سالم', 'جمع مذكر سالم', 'جمع تكسير', 'مفرد', 1],
                [firstLesson.id, 1, 'ما إعراب كلمة "الطالبُ" في جملة "الطالبُ مجتهدٌ"؟', 'مبتدأ مرفوع', 'خبر مرفوع', 'فاعل مرفوع', 'مفعول به منصوب', 0],
                [firstLesson.id, 1, 'ما معنى كلمة "الفداء"؟', 'الكذب', 'الظلم', 'التضحية', 'النصر', 2],
                [firstLesson.id, 1, 'ما الحرف المنطوق غير المكتوب في "هذا"؟', 'النون', 'اللام', 'الألف', 'ليس هناك', 2],
                [firstLesson.id, 1, 'ما الحرف المنطوق غير المكتوب في "رجلٌ"؟', 'النون', 'اللام', 'الألف', 'ليس هناك', 0]
            ];
            
            for (const [lessonId, level, q, a, b, c, d, correct] of questions) {
                await this.db.run(
                    `INSERT INTO questions 
                    (lesson_id, level, question_text, option_a, option_b, option_c, option_d, correct_answer) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [lessonId, level, q, a, b, c, d, correct]
                );
            }
            
            // إضافة مستخدم تجريبي (طالب)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('student123', salt);
            
            await this.db.run(
                'INSERT INTO users (username, password, full_name, grade_level) VALUES (?, ?, ?, ?)',
                ['student1', hashedPassword, 'أحمد محمد', 1]
            );
            
            console.log('✅ تم إضافة البيانات المبدئية بنجاح');
        }
    }

    // دوال الاستعلامات
    async getUserByUsername(username) {
        return this.db.get('SELECT * FROM users WHERE username = ?', username);
    }

    async getUserById(id) {
        return this.db.get('SELECT id, username, full_name, grade_level, role FROM users WHERE id = ?', id);
    }

    async createUser(userData) {
        const { username, password, fullName, gradeLevel } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const result = await this.db.run(
            'INSERT INTO users (username, password, full_name, grade_level) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, fullName, gradeLevel]
        );
        
        return result.lastID;
    }

    async getGrades() {
        return this.db.all('SELECT * FROM grades ORDER BY grade_number');
    }

    async getSubjectsByGrade(gradeId) {
        return this.db.all(
            `SELECT s.*, COUNT(DISTINCT l.id) as lessons_count 
             FROM subjects s 
             LEFT JOIN lessons l ON s.id = l.subject_id 
             WHERE s.grade_id = ? 
             GROUP BY s.id`,
            gradeId
        );
    }

    async getLessonsBySubject(subjectId) {
        return this.db.all(
            `SELECT l.*, COUNT(DISTINCT q.id) as questions_count 
             FROM lessons l 
             LEFT JOIN questions q ON l.id = q.lesson_id 
             WHERE l.subject_id = ? 
             GROUP BY l.id 
             ORDER BY l.order_index`,
            subjectId
        );
    }

    async getQuestionsByLesson(lessonId, level = 1) {
        return this.db.all(
            'SELECT * FROM questions WHERE lesson_id = ? AND level = ? ORDER BY id',
            [lessonId, level]
        );
    }

    async saveExamAttempt(attemptData) {
        const { userId, lessonId, score, correctAnswers, totalQuestions, answersJson } = attemptData;
        
        const result = await this.db.run(
            `INSERT INTO exam_attempts 
             (user_id, lesson_id, score, correct_answers, total_questions, answers_json, completed_at) 
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [userId, lessonId, score, correctAnswers, totalQuestions, answersJson]
        );
        
        // تحديث تقدم الطالب
        await this.updateStudentProgress(userId, lessonId, score, correctAnswers);
        
        return result.lastID;
    }

    async updateStudentProgress(userId, lessonId, score, correctAnswers) {
        const existing = await this.db.get(
            'SELECT * FROM student_progress WHERE user_id = ? AND lesson_id = ?',
            [userId, lessonId]
        );
        
        if (existing) {
            if (score > existing.best_score) {
                await this.db.run(
                    `UPDATE student_progress 
                     SET best_score = ?, attempts_count = attempts_count + 1, 
                         last_attempt_date = CURRENT_TIMESTAMP 
                     WHERE user_id = ? AND lesson_id = ?`,
                    [score, userId, lessonId]
                );
            } else {
                await this.db.run(
                    `UPDATE student_progress 
                     SET attempts_count = attempts_count + 1, last_attempt_date = CURRENT_TIMESTAMP 
                     WHERE user_id = ? AND lesson_id = ?`,
                    [userId, lessonId]
                );
            }
        } else {
            await this.db.run(
                `INSERT INTO student_progress 
                 (user_id, lesson_id, best_score, attempts_count, last_attempt_date) 
                 VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
                [userId, lessonId, score]
            );
        }
    }

    async getStudentProgress(userId) {
        return this.db.all(
            `SELECT sp.*, l.lesson_name, s.subject_name 
             FROM student_progress sp
             JOIN lessons l ON sp.lesson_id = l.id
             JOIN subjects s ON l.subject_id = s.id
             WHERE sp.user_id = ?`,
            userId
        );
    }
}

module.exports = new Database();