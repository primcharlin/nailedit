// Game state
const gameState = {
    currentMode: null, // 'freestyle' or 'challenge'
    selectedColor: null,
    selectedDecoration: null,
    selectedNail: null,
    timeRemaining: 60,
    timerInterval: null,
    challengeLevel: 1,
    nailDesigns: {
        1: {}, // Stores the current design for each nail
        2: {},
        3: {},
        4: {},
        5: {},
    },
    challengeReference: null, // Stores reference design for challenge mode
};

// Colors and decorations
const colors = [
    "#FF0000",
    "#FFA500",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#800080",
    "#FF69B4",
    "#000000",
    "#FFFFFF",
    "#FFC0CB",
    "#00FFFF",
    "#FFD700",
    "#808080",
    "#008000",
    "#ADD8E6",
    "#FF4500",
];

const decorations = [
    { name: "Dots", src: "/api/placeholder/80/80" },
    { name: "Stripes", src: "/api/placeholder/80/80" },
    { name: "Stars", src: "/api/placeholder/80/80" },
    { name: "Hearts", src: "/api/placeholder/80/80" },
    { name: "Flowers", src: "/api/placeholder/80/80" },
    { name: "Glitter", src: "/api/placeholder/80/80" },
];

// Challenge designs (would be replaced with actual designs)
const challengeDesigns = [
    {
        level: 1,
        image: "/api/placeholder/300/200",
        timeLimit: 60,
        design: {
            1: { color: "#FF0000", decoration: null },
            2: { color: "#FF0000", decoration: null },
            3: { color: "#FF0000", decoration: null },
            4: { color: "#FF0000", decoration: null },
            5: { color: "#FF0000", decoration: null },
        },
    },
    {
        level: 2,
        image: "/api/placeholder/300/200",
        timeLimit: 45,
        design: {
            1: { color: "#FF69B4", decoration: "Hearts" },
            2: { color: "#FF69B4", decoration: null },
            3: { color: "#FF69B4", decoration: "Hearts" },
            4: { color: "#FF69B4", decoration: null },
            5: { color: "#FF69B4", decoration: "Hearts" },
        },
    },
];

// DOM Elements
const mainMenu = document.getElementById("main-menu");
const gameArea = document.getElementById("game-area");
const freestyleButton = document.getElementById("freestyle-button");
const challengeButton = document.getElementById("challenge-button");
const nails = document.querySelectorAll(".nail");
const colorPalette = document.getElementById("color-palette");
const decorationsContainer = document.getElementById("decorations");
const challengeUI = document.getElementById("challenge-ui");
const referenceImage = document.getElementById("reference-image");
const timerElement = document.getElementById("timer");
const resetButton = document.getElementById("reset-button");
const backButton = document.getElementById("back-button");
const doneButton = document.getElementById("done-button");
const resultModal = document.getElementById("result-modal");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const tryAgainButton = document.getElementById("try-again-button");
const menuButton = document.getElementById("menu-button");

// Initialize game
function initGame() {
    setupColorPalette();
    setupDecorations();
    setupEventListeners();
}

// Create color palette
function setupColorPalette() {
    colors.forEach((color) => {
        const colorOption = document.createElement("div");
        colorOption.className = "color-option";
        colorOption.style.backgroundColor = color;
        colorOption.dataset.color = color;
        colorPalette.appendChild(colorOption);
    });
}

// Create decoration options
function setupDecorations() {
    decorations.forEach((decoration) => {
        const decorationOption = document.createElement("div");
        decorationOption.className = "decoration-option";
        decorationOption.style.backgroundImage = `url(${decoration.src})`;
        decorationOption.dataset.decoration = decoration.name;
        decorationsContainer.appendChild(decorationOption);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mode selection
    freestyleButton.addEventListener("click", () => startGame("freestyle"));
    challengeButton.addEventListener("click", () => startGame("challenge"));

    // Color selection
    colorPalette.addEventListener("click", (e) => {
        if (e.target.classList.contains("color-option")) {
            selectColor(e.target);
        }
    });

    // Decoration selection
    decorationsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("decoration-option")) {
            selectDecoration(e.target);
        }
    });

    // Nail selection
    nails.forEach((nail) => {
        nail.addEventListener("click", () => {
            applyDesign(nail);
        });
    });

    // Control buttons
    resetButton.addEventListener("click", resetDesign);
    backButton.addEventListener("click", returnToMainMenu);
    doneButton.addEventListener("click", completeDesign);

    // Modal buttons
    tryAgainButton.addEventListener("click", () => {
        resultModal.style.display = "none";
        startGame("challenge");
    });

    menuButton.addEventListener("click", () => {
        resultModal.style.display = "none";
        returnToMainMenu();
    });
}

// Start the game based on selected mode
function startGame(mode) {
    gameState.currentMode = mode;
    mainMenu.style.display = "none";
    gameArea.style.display = "block";

    resetDesign();

    if (mode === "challenge") {
        startChallengeMode();
    } else {
        challengeUI.style.display = "none";
    }
}

// Setup challenge mode
function startChallengeMode() {
    challengeUI.style.display = "block";

    // Get challenge design based on level
    const challenge = challengeDesigns.find(
        (c) => c.level === gameState.challengeLevel
    );
    gameState.challengeReference = challenge.design;
    gameState.timeRemaining = challenge.timeLimit;

    // Set reference image
    referenceImage.style.backgroundImage = `url(${challenge.image})`;

    // Update timer display
    timerElement.textContent = gameState.timeRemaining;

    // Start timer
    startTimer();
}

// Timer for challenge mode
function startTimer() {
    clearInterval(gameState.timerInterval);

    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        timerElement.textContent = gameState.timeRemaining;

        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            evaluateChallenge();
        }
    }, 1000);
}

// Select a color
function selectColor(colorElement) {
    // Remove selected class from all colors
    document.querySelectorAll(".color-option").forEach((el) => {
        el.classList.remove("selected");
    });

    // Add selected class to clicked color
    colorElement.classList.add("selected");

    // Update game state
    gameState.selectedColor = colorElement.dataset.color;
    gameState.selectedDecoration = null;

    document.querySelectorAll(".decoration-option").forEach((el) => {
        el.classList.remove("selected");
    });
}

// Select a decoration
function selectDecoration(decorationElement) {
    // Remove selected class from all decorations
    document.querySelectorAll(".decoration-option").forEach((el) => {
        el.classList.remove("selected");
    });

    // Add selected class to clicked decoration
    decorationElement.classList.add("selected");

    // Update game state
    gameState.selectedDecoration = decorationElement.dataset.decoration;
    gameState.selectedColor = null;

    document.querySelectorAll(".color-option").forEach((el) => {
        el.classList.remove("selected");
    });
}

// Apply design to nail
function applyDesign(nail) {
    const nailId = nail.id.split("-")[1];

    if (gameState.selectedColor) {
        nail.style.backgroundColor = gameState.selectedColor;
        gameState.nailDesigns[nailId].color = gameState.selectedColor;
    }

    if (gameState.selectedDecoration) {
        // Find the decoration data
        const decoration = decorations.find(
            (d) => d.name === gameState.selectedDecoration
        );

        // Apply decoration
        nail.style.backgroundImage = `url(${decoration.src})`;
        nail.style.backgroundSize = "contain";
        nail.style.backgroundPosition = "center";
        nail.style.backgroundRepeat = "no-repeat";

        gameState.nailDesigns[nailId].decoration = gameState.selectedDecoration;
    }
}

// Reset nail design
function resetDesign() {
    nails.forEach((nail) => {
        const nailId = nail.id.split("-")[1];

        nail.style.backgroundColor = "#ffdee7";
        nail.style.backgroundImage = "none";

        gameState.nailDesigns[nailId] = {};
    });
}

// Return to main menu
function returnToMainMenu() {
    clearInterval(gameState.timerInterval);
    gameArea.style.display = "none";
    mainMenu.style.display = "flex";
}

// Complete design (done button clicked)
function completeDesign() {
    if (gameState.currentMode === "challenge") {
        clearInterval(gameState.timerInterval);
        evaluateChallenge();
    } else {
        // For freestyle mode, could save the design or show a confirmation
        alert("Design saved!");
    }
}

// Evaluate challenge results
function evaluateChallenge() {
    let score = 0;
    let totalPoints = 0;

    // Compare each nail with reference design
    for (let i = 1; i <= 5; i++) {
        const userDesign = gameState.nailDesigns[i];
        const refDesign = gameState.challengeReference[i];

        // Compare color (50% of score)
        if (userDesign.color === refDesign.color) {
            score += 50;
        }
        totalPoints += 50;

        // Compare decoration (50% of score)
        if (userDesign.decoration === refDesign.decoration) {
            score += 50;
        }
        totalPoints += 50;
    }

    // Calculate percentage
    const percentage = Math.round((score / totalPoints) * 100);

    // Show results
    resultTitle.textContent = "Challenge Complete!";
    resultMessage.textContent = `You scored ${percentage}% match.`;

    if (percentage >= 80) {
        resultMessage.textContent += " Great job!";
        gameState.challengeLevel = Math.min(
            gameState.challengeLevel + 1,
            challengeDesigns.length
        );
    } else {
        resultMessage.textContent += " Try again to improve your score.";
    }

    resultModal.style.display = "block";
}

// Initialize the game when the page loads
window.addEventListener("DOMContentLoaded", initGame);
