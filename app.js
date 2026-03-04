/* app.js */

// State
let currentQuestionIndex = 0;
let score = 0;
let health = 5;
let answered = false;
let correctCount = 0;
let incorrectCount = 0;

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const startBtn = document.getElementById('start-btn');
const header = document.getElementById('header');
const main = document.getElementById('main');
const footer = document.getElementById('footer');
const progressBar = document.getElementById('progress-bar');
const healthCount = document.getElementById('health-count');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const inputContainer = document.getElementById('input-container');
const identificationInput = document.getElementById('identification-input');
const checkBtn = document.getElementById('check-btn');
const feedbackSheet = document.getElementById('feedback-sheet');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const nextBtn = document.getElementById('next-btn');
const resultScreen = document.getElementById('result-screen');
const finalScore = document.getElementById('final-score');
const correctCountEl = document.getElementById('correct-count');
const incorrectCountEl = document.getElementById('incorrect-count');
const accuracyPercentEl = document.getElementById('accuracy-percent');
const restartBtn = document.getElementById('restart-btn');

// Initialize
function init() {
    shuffleArray(questions);
    renderQuestion();
    updateProgress();
    updateHealth();
}

// Render current question
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.innerText = q.question;
    answered = false;
    checkBtn.disabled = true;
    checkBtn.innerText = "CHECK";

    // Reset containers
    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    inputContainer.classList.add('hidden');
    identificationInput.value = '';

    if (q.type === 'mcq' || q.type === 'tf') {
        optionsContainer.classList.remove('hidden');

        let optionsToRender = q.type === 'mcq' ? [...q.options] : ["True", "False"];

        // Only shuffle MCQ options to keep True always first
        if (q.type === 'mcq') shuffleArray(optionsToRender);

        optionsToRender.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = option;
            btn.onclick = () => selectOption(btn, option);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'identification') {
        inputContainer.classList.remove('hidden');
        identificationInput.value = '';
        identificationInput.oninput = () => {
            checkBtn.disabled = identificationInput.value.trim() === '';
        };
        // Auto focus for faster typing (optional, might bring up keyboard unwantedly on mobile)
        // setTimeout(() => identificationInput.focus(), 100);
    }
}

// Option selection
let selectedAnswer = null;
function selectOption(btn, option) {
    if (answered) return;

    // Deselect all
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));

    // Select clicked
    btn.classList.add('selected');
    selectedAnswer = option;
    checkBtn.disabled = false;
}

// Check Answer
checkBtn.onclick = () => {
    if (answered) return; // Prevent double click

    const q = questions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswer = '';

    if (q.type === 'mcq' || q.type === 'tf') {
        userAnswer = selectedAnswer;
        isCorrect = userAnswer === q.answer;
    } else {
        userAnswer = identificationInput.value.trim();
        // Case-insensitive, flexible matching
        isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
    }

    answered = true;
    checkBtn.disabled = true;

    showFeedback(isCorrect, q.answer);

    // Visual feedback for options
    if (q.type === 'mcq' || q.type === 'tf') {
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (btn.innerText === q.answer) {
                btn.classList.add('correct-option');
            } else if (btn.innerText === userAnswer && !isCorrect) {
                btn.classList.add('incorrect-option');
            }
        });
    }

    if (isCorrect) {
        score += 10;
        correctCount++;
        playSound('correct');
    } else {
        health--;
        incorrectCount++;
        updateHealth();
        playSound('incorrect');
    }

    updateProgress();
};

// Feedback Sheet
function showFeedback(isCorrect, correctAnswer) {
    feedbackSheet.classList.remove('hidden');
    // slight delay to ensure transition happens
    setTimeout(() => {
        feedbackSheet.classList.add('show');
    }, 10);

    // reset classes
    feedbackSheet.classList.remove('correct', 'incorrect');
    feedbackMessage.classList.add('hidden');

    if (isCorrect) {
        feedbackSheet.classList.add('correct');
        feedbackTitle.innerText = getRandomEncouragement();
    } else {
        feedbackSheet.classList.add('incorrect');
        feedbackTitle.innerText = "Incorrect";
        feedbackMessage.innerText = `Correct Answer: ${correctAnswer}`;
        feedbackMessage.classList.remove('hidden');
    }

    nextBtn.disabled = false;
}

function hideFeedback() {
    feedbackSheet.classList.remove('show');
    setTimeout(() => {
        feedbackSheet.classList.add('hidden');
    }, 300); // match CSS transition
}

// Next Question
nextBtn.onclick = () => {
    hideFeedback();

    if (health <= 0) {
        showResult();
        return;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex >= questions.length) {
        showResult();
    } else {
        renderQuestion();
    }
};

// Result Screen
function showResult() {
    resultScreen.classList.remove('hidden');
    header.classList.add('hidden');
    main.classList.add('hidden');
    footer.classList.add('hidden');

    // Calculate final score
    let finalXP = score + (health * 5); // Bonus for remaining health

    // Animate score counter
    animateValue(finalScore, 0, finalXP, 1500);

    // Update detailed stats
    correctCountEl.innerText = correctCount;
    incorrectCountEl.innerText = incorrectCount;

    const totalAnswered = correctCount + incorrectCount;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    accuracyPercentEl.innerText = `${accuracy}%`;
}

// Restart
restartBtn.onclick = () => {
    currentQuestionIndex = 0;
    score = 0;
    health = 5;
    correctCount = 0;
    incorrectCount = 0;
    resultScreen.classList.add('hidden');

    // Go back to the welcome screen
    welcomeScreen.classList.remove('hidden');
};

// Utility: Update Progress
function updateProgress() {
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Utility: Update Health
function updateHealth() {
    healthCount.innerText = health;
    const icon = document.getElementById('health-icon');
    icon.style.transform = 'scale(1.5)';
    setTimeout(() => {
        icon.style.transform = 'scale(1)';
    }, 200);
}

// Utility: Shuffle Array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Utility: Random encouragements
const encouragements = ["Excellent!", "Great job!", "Correct!", "Awesome!", "You're on fire!"];
function getRandomEncouragement() {
    return encouragements[Math.floor(Math.random() * encouragements.length)];
}

// Utility: Sound Effects (Stubs for real audio)
function playSound(type) {
    // In a real app, use Audio API here.
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.play();
}

// Utility: Animate Number
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Close button (dummy)
document.getElementById('close-btn').onclick = () => {
    if (confirm("Are you sure you want to quit the lesson? You will lose your progress.")) {
        // Here you would normally route back to a home screen
        alert("Returning to Home Screen...");
    }
};

// Start App
startBtn.onclick = () => {
    welcomeScreen.classList.add('hidden');
    header.classList.remove('hidden');
    main.classList.remove('hidden');
    footer.classList.remove('hidden');
    init();
};
