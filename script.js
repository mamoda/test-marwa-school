        // قاعدة البيانات المتكاملة (مواد - دروس - أسئلة)
        const schoolDatabase = {
            grade1: {
                name: "الصف الأول الابتدائي",
                subjects: {
                    arabic: {
                        name: "اللغة العربية",
                        icon: "fa-language",
                        lessons: {
                            lesson1: {
                                name: "المدخل إلى النحو",
                                description: "أساسيات النحو العربي",
                                difficulty: "easy",
                                questionsCount: 10,
                                levels: {
                                    1: [
                                        { question: "ما نوع الجمع في كلمة 'مُعَلِّمُونَ'؟", options: ["جمع مؤنث سالم", "جمع مذكر سالم", "جمع تكسير", "مفرد"], correct: 1 },
                                        { question: "ما إعراب كلمة 'الطالبُ' في جملة 'الطالبُ مجتهدٌ'؟", options: ["مبتدأ مرفوع", "خبر مرفوع", "فاعل مرفوع", "مفعول به منصوب"], correct: 0 },
                                        { question: "ما معنى كلمة 'الفداء'؟", options: ["الكذب", "الظلم", "التضحية", "النصر"], correct: 2 },
                                        { question: "ما الحرف المنطوق غير المكتوب في 'هذا'؟", options: [" النون", "اللام ", " الألف", "ليس هناك"], correct: 2 },
                                        { question: "ما الحرف المنطوق غير المكتوب في 'رجلٌ'؟", options: [" النون", "اللام ", " الألف", "ليس هناك"], correct: 0 },
                                        { question: "ما جمع كلمة 'كِتَاب'؟", options: ["كُتُب", "كِتَابَات", "كُتَّاب", "كِتَابُونَ"], correct: 0 },
                                        { question: "ما الفعل الأمر من الفعل 'يَكْتُبُ'؟", options: ["اُكْتُبْ", "كُتِبَ", "اِكْتَبْ", "كَتَّبَ"], correct: 0 },
                                        { question: "ما نوع الجملة 'الجَوُّ مُشْمِسٌ'؟", options: ["جملة اسمية", "جملة فعلية", "جملة إنشائية", "جملة طلبية"], correct: 0 },
                                        { question: "ما إعراب كلمة 'مُجتَهدٌ' في 'الطالبُ مُجتهِدٌ'؟", options: ["حال منصوب", "مفعول به", "خبر مرفوع", "نعت منصوب"], correct: 2 },
                                        { question: "ما مرادف كلمة 'الحَزِين'؟", options: ["الْكَئِيب", "الفَرِح", "الْمَرِح", "السَّعِيد"], correct: 0 }
                                    ]
                                }
                            },
                            lesson2: {
                                name: "الأسماء الموصولة",
                                description: "تعلم الأسماء الموصولة واستخداماتها",
                                difficulty: "medium",
                                questionsCount: 10,
                                levels: {
                                    1: [
                                        { question: "من الأسماء الموصولة؟", options: ["الذي", "هذا", "تلك", "أنا"], correct: 0 },
                                        { question: "الاسم الموصول للجمع المذكر؟", options: ["الذين", "اللاتي", "اللذان", "التي"], correct: 0 },
                                        { question: "الاسم الموصول للمثنى المؤنث؟", options: ["اللتان", "اللذان", "الذين", "اللاتي"], correct: 0 }
                                    ]
                                }
                            }
                        }
                    },
                    math: {
                        name: "الرياضيات",
                        icon: "fa-calculator",
                        lessons: {
                            lesson1: {
                                name: "الجمع والطرح",
                                description: "عمليات الجمع والطرح للأعداد",
                                difficulty: "easy",
                                questionsCount: 10,
                                levels: {}
                            }
                        }
                    },
                    science: {
                        name: "العلوم",
                        icon: "fa-flask",
                        lessons: {}
                    }
                }
            },
            grade2: {
                name: "الصف الثاني الابتدائي",
                subjects: {
                    arabic: {
                        name: "اللغة العربية",
                        icon: "fa-language",
                        lessons: {
                            lesson1: {
                                name: "المبتدأ والخبر",
                                description: "الجملة الاسمية وأركانها",
                                difficulty: "medium",
                                questionsCount: 10,
                                levels: {}
                            }
                        }
                    }
                }
            },
            grade3: {
                name: "الصف الثالث الابتدائي",
                subjects: {}
            },
            grade4: {
                name: "الصف الرابع الابتدائي",
                subjects: {}
            }
        };

        // حالة التطبيق
        const appState = {
            selectedGrade: null,
            selectedSubject: null,
            selectedLesson: null,
            currentLevel: 1,
            currentQuestion: 0,
            score: 0,
            userAnswers: [],
            totalLevels: 3,
            questionsData: null
        };

        // عناصر DOM
        const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
        const gradeSection = document.getElementById('gradeSection');
        const subjectSection = document.getElementById('subjectSection');
        const lessonsSection = document.getElementById('lessonsSection');
        const statsSection = document.getElementById('statsSection');
        const levelIndicator = document.getElementById('levelIndicator');
        const quizContainer = document.getElementById('quizContainer');
        const resultContainer = document.getElementById('resultContainer');
        const selectedGradeDisplay = document.getElementById('selectedGradeDisplay');
        const subjectCards = document.getElementById('subjectCards');
        const lessonsGrid = document.getElementById('lessonsGrid');
        const subjectName = document.getElementById('subjectName');
        const gradeName = document.getElementById('gradeName');
        const subjectIcon = document.getElementById('subjectIcon');
        const lessonsCount = document.getElementById('lessonsCount');
        const totalQuestions = document.getElementById('totalQuestions');
        const currentLessonName = document.getElementById('currentLessonName');
        const quizLessonName = document.getElementById('quizLessonName').querySelector('span');
        
        // أزرار التنقل
        const backToGrades = document.getElementById('backToGrades');
        const backToSubjects = document.getElementById('backToSubjects');
        const moreLessonsBtn = document.getElementById('moreLessonsBtn');
        
        // أزرار الاختبار
        const startBtn = document.getElementById('startBtn'); // ملاحظة: هذا المعرف غير موجود في HTML الجديد، سنستخدم آلية أخرى
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const continueBtn = document.getElementById('continueBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        // عناصر عرض البيانات
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionNum = document.getElementById('questionNum');
        const questionLevel = document.getElementById('questionLevel');
        const currentLevelEl = document.getElementById('currentLevel');
        const remainingQuestionsEl = document.getElementById('remainingQuestions');
        const scoreEl = document.getElementById('score');
        const levelProgress = document.getElementById('levelProgress');
        const levelNumber = document.getElementById('levelNumber');
        const progressPercent = document.getElementById('progressPercent');
        const resultScore = document.getElementById('resultScore');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const levelUpMessage = document.getElementById('levelUpMessage');
        const correctAnswersSpan = document.getElementById('correctAnswers');
        const wrongAnswersSpan = document.getElementById('wrongAnswers');
        const totalPointsSpan = document.getElementById('totalPoints');

        // تحديث مسار التنقل
        function updateBreadcrumb(activeStep) {
            breadcrumbItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.step === activeStep) {
                    item.classList.add('active');
                }
            });
        }

        // اختيار الصف
        document.querySelectorAll('.selector-card[data-grade]').forEach(card => {
            card.addEventListener('click', function() {
                const grade = this.dataset.grade;
                if (grade > 4) {
                    alert('هذا الصف سيتوفر قريباً');
                    return;
                }
                
                document.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                appState.selectedGrade = 'grade' + grade;
                appState.selectedSubject = null;
                appState.selectedLesson = null;
                
                // تحديث عرض الصف المختار
                selectedGradeDisplay.textContent = schoolDatabase[appState.selectedGrade]?.name || '';
                
                // عرض المواد المتاحة
                loadSubjects();
                
                // إخفاء الأقسام الأخرى وإظهار قسم المواد
                gradeSection.style.display = 'none';
                subjectSection.style.display = 'block';
                lessonsSection.classList.remove('active');
                statsSection.style.display = 'none';
                levelIndicator.style.display = 'none';
                quizContainer.classList.remove('active');
                resultContainer.classList.remove('active');
                
                updateBreadcrumb('subject');
            });
        });

        // تحميل المواد
        function loadSubjects() {
            const gradeData = schoolDatabase[appState.selectedGrade];
            if (!gradeData) return;
            
            subjectCards.innerHTML = '';
            
            for (const [subjectKey, subject] of Object.entries(gradeData.subjects)) {
                const lessonsCount = Object.keys(subject.lessons).length;
                const card = document.createElement('div');
                card.className = 'selector-card';
                card.dataset.subject = subjectKey;
                card.innerHTML = `
                    <div class="card-icon"><i class="fas ${subject.icon}"></i></div>
                    <h3>${subject.name}</h3>
                    <p>${lessonsCount} دروس</p>
                `;
                
                card.addEventListener('click', () => selectSubject(subjectKey));
                subjectCards.appendChild(card);
            }
        }

        // اختيار المادة
        function selectSubject(subjectKey) {
            appState.selectedSubject = subjectKey;
            const gradeData = schoolDatabase[appState.selectedGrade];
            const subjectData = gradeData.subjects[subjectKey];
            
            // تحديث معلومات رأس الدروس
            subjectName.textContent = subjectData.name;
            gradeName.textContent = gradeData.name;
            subjectIcon.innerHTML = `<i class="fas ${subjectData.icon}"></i>`;
            
            const lessonsArray = Object.entries(subjectData.lessons);
            lessonsCount.textContent = lessonsArray.length + ' دروس';
            
            let totalQ = 0;
            lessonsArray.forEach(([key, lesson]) => {
                if (lesson.levels && lesson.levels[1]) {
                    totalQ += lesson.levels[1].length;
                }
            });
            totalQuestions.textContent = totalQ + ' سؤال';
            
            // عرض الدروس
            loadLessons(subjectData.lessons);
            
            // إظهار قسم الدروس
            subjectSection.style.display = 'none';
            lessonsSection.classList.add('active');
            
            updateBreadcrumb('lesson');
        }

        // تحميل الدروس
        function loadLessons(lessons) {
            lessonsGrid.innerHTML = '';
            
            for (const [lessonKey, lesson] of Object.entries(lessons)) {
                const difficultyClass = {
                    'easy': 'difficulty-easy',
                    'medium': 'difficulty-medium',
                    'hard': 'difficulty-hard'
                }[lesson.difficulty] || 'difficulty-easy';
                
                const difficultyText = {
                    'easy': 'سهل',
                    'medium': 'متوسط',
                    'hard': 'صعب'
                }[lesson.difficulty] || 'سهل';
                
                const questionsCount = lesson.levels?.[1]?.length || 0;
                const progress = lesson.progress || 0;
                
                const card = document.createElement('div');
                card.className = 'lesson-card';
                card.dataset.lesson = lessonKey;
                card.innerHTML = `
                    <div class="difficulty-badge ${difficultyClass}">${difficultyText}</div>
                    <div class="lesson-icon"><i class="fas ${lesson.difficulty === 'easy' ? 'fa-smile' : 'fa-book'}"></i></div>
                    <h4>${lesson.name}</h4>
                    <p style="color: #666; margin-bottom: 10px;">${lesson.description || ''}</p>
                    <div class="lesson-meta">
                        <span><i class="fas fa-question-circle"></i> ${questionsCount} سؤال</span>
                        <span><i class="fas fa-signal"></i> ${difficultyText}</span>
                    </div>
                    <div class="lesson-progress">
                        <div class="lesson-progress-bar" style="width: ${progress}%;"></div>
                    </div>
                `;
                
                card.addEventListener('click', () => selectLesson(lessonKey, lesson));
                lessonsGrid.appendChild(card);
            }
        }

        // اختيار الدرس
        function selectLesson(lessonKey, lesson) {
            appState.selectedLesson = lessonKey;
            appState.currentLevel = 1;
            appState.currentQuestion = 0;
            appState.score = 0;
            appState.userAnswers = [];
            
            // تحميل أسئلة المستوى الأول للدرس
            if (lesson.levels && lesson.levels[1]) {
                appState.questionsData = { 1: lesson.levels[1] };
            }
            
            // تحديث اسم الدرس المعروض
            currentLessonName.textContent = lesson.name;
            quizLessonName.textContent = lesson.name;
            
            // إظهار أقسام الاختبار
            lessonsSection.classList.remove('active');
            statsSection.style.display = 'grid';
            levelIndicator.style.display = 'flex';
            quizContainer.classList.add('active');
            
            updateBreadcrumb('quiz');
            loadQuestion();
            updateDashboard();
        }

        // تحديث لوحة المعلومات
        function updateDashboard() {
            currentLevelEl.textContent = appState.currentLevel;
            const remaining = appState.questionsData ? 
                (10 - appState.currentQuestion) : 0;
            remainingQuestionsEl.textContent = remaining > 0 ? remaining : 0;
            scoreEl.textContent = appState.score;
            
            const progressPercentValue = (appState.currentQuestion / 10) * 100;
            levelProgress.style.width = `${progressPercentValue}%`;
            progressPercent.textContent = `${Math.round(progressPercentValue)}%`;
            levelNumber.textContent = appState.currentLevel;
        }

        // تحميل السؤال
        function loadQuestion() {
            if (!appState.questionsData || !appState.questionsData[appState.currentLevel]) return;
            
            const questions = appState.questionsData[appState.currentLevel];
            const currentQ = questions[appState.currentQuestion];
            
            questionText.textContent = currentQ.question;
            questionNum.textContent = appState.currentQuestion + 1;
            questionLevel.textContent = appState.currentLevel;
            
            optionsContainer.innerHTML = '';
            
            const optionLetters = ['أ', 'ب', 'ج', 'د'];
            currentQ.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option-card');
                if (appState.userAnswers[appState.currentQuestion] === index) {
                    optionElement.classList.add('selected');
                }
                
                optionElement.innerHTML = `
                    <div class="option-marker">${optionLetters[index]}</div>
                    <div class="option-text">${option}</div>
                `;
                
                optionElement.addEventListener('click', () => selectOption(index));
                optionsContainer.appendChild(optionElement);
            });
            
            prevBtn.disabled = appState.currentQuestion === 0;
            
            if (appState.currentQuestion === 9) {
                nextBtn.innerHTML = 'إنهاء الاختبار <i class="fas fa-flag-checkered"></i>';
            } else {
                nextBtn.innerHTML = 'التالي <i class="fas fa-arrow-left"></i>';
            }
            
            updateDashboard();
        }

        // اختيار إجابة
        function selectOption(optionIndex) {
            document.querySelectorAll('.option-card').forEach(option => {
                option.classList.remove('selected');
            });
            
            document.querySelectorAll('.option-card')[optionIndex].classList.add('selected');
            
            appState.userAnswers[appState.currentQuestion] = optionIndex;
            
            const questions = appState.questionsData[appState.currentLevel];
            const currentQ = questions[appState.currentQuestion];
            
            if (optionIndex === currentQ.correct && !appState.userAnswers[appState.currentQuestion + 100]) {
                appState.score += 10;
                scoreEl.textContent = appState.score;
                appState.userAnswers[appState.currentQuestion + 100] = true;
            }
        }

        // السؤال التالي
        function nextQuestion() {
            if (appState.userAnswers[appState.currentQuestion] === undefined) {
                alert('يرجى اختيار إجابة قبل المتابعة');
                return;
            }
            
            if (appState.currentQuestion === 9) {
                finishQuiz();
                return;
            }
            
            appState.currentQuestion++;
            loadQuestion();
        }

        // السؤال السابق
        function prevQuestion() {
            if (appState.currentQuestion > 0) {
                appState.currentQuestion--;
                loadQuestion();
            }
        }

        // إنهاء الاختبار
        function finishQuiz() {
            const questions = appState.questionsData[appState.currentLevel];
            let correctAnswers = 0;
            
            for (let i = 0; i < questions.length; i++) {
                if (appState.userAnswers[i] === questions[i].correct) {
                    correctAnswers++;
                }
            }
            
            quizContainer.classList.remove('active');
            resultContainer.classList.add('active');
            
            resultScore.textContent = `${correctAnswers * 10}/100`;
            correctAnswersSpan.textContent = correctAnswers;
            wrongAnswersSpan.textContent = 10 - correctAnswers;
            totalPointsSpan.textContent = appState.score;
            
            resultTitle.textContent = correctAnswers >= 7 ? "أحسنت! لقد اجتزت الاختبار بنجاح" : "حاول مرة أخرى لتحسين نتيجتك";
            
            if (correctAnswers >= 7) {
                resultMessage.textContent = `أحسنت! لقد حصلت على ${correctAnswers} من 10 إجابات صحيحة.`;
                continueBtn.style.display = 'inline-flex';
                levelUpMessage.style.display = 'block';
            } else {
                resultMessage.textContent = `حصلت على ${correctAnswers} من 10 إجابات صحيحة. تحتاج إلى 7 إجابات صحيحة على الأقل للانتقال للمستوى التالي.`;
                continueBtn.style.display = 'none';
                levelUpMessage.style.display = 'none';
            }
        }

        // العودة للصفوف
        backToGrades.addEventListener('click', () => {
            gradeSection.style.display = 'block';
            subjectSection.style.display = 'none';
            lessonsSection.classList.remove('active');
            statsSection.style.display = 'none';
            levelIndicator.style.display = 'none';
            quizContainer.classList.remove('active');
            resultContainer.classList.remove('active');
            updateBreadcrumb('grade');
        });

        // العودة للمواد
        backToSubjects.addEventListener('click', () => {
            subjectSection.style.display = 'block';
            lessonsSection.classList.remove('active');
            statsSection.style.display = 'none';
            levelIndicator.style.display = 'none';
            quizContainer.classList.remove('active');
            resultContainer.classList.remove('active');
            updateBreadcrumb('subject');
        });

        // اختيار درس آخر من النتائج
        moreLessonsBtn.addEventListener('click', () => {
            lessonsSection.classList.add('active');
            statsSection.style.display = 'none';
            levelIndicator.style.display = 'none';
            quizContainer.classList.remove('active');
            resultContainer.classList.remove('active');
            updateBreadcrumb('lesson');
        });

        // أحداث الأزرار
        nextBtn.addEventListener('click', nextQuestion);
        prevBtn.addEventListener('click', prevQuestion);
        continueBtn.addEventListener('click', nextLevel);
        restartBtn.addEventListener('click', () => {
            if (appState.selectedLesson) {
                const gradeData = schoolDatabase[appState.selectedGrade];
                const lesson = gradeData.subjects[appState.selectedSubject].lessons[appState.selectedLesson];
                selectLesson(appState.selectedLesson, lesson);
            }
        });

        // الانتقال للمستوى التالي
        function nextLevel() {
            if (appState.currentLevel < appState.totalLevels) {
                appState.currentLevel++;
                appState.currentQuestion = 0;
                appState.userAnswers = [];
                
                resultContainer.classList.remove('active');
                quizContainer.classList.add('active');
                
                loadQuestion();
                updateDashboard();
                
                continueBtn.style.display = 'none';
                levelUpMessage.style.display = 'none';
            }
        }