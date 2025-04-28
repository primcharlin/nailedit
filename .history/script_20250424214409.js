// Game state
const gameState = {
    currentMode: null, // 'freestyle' or 'challenge'
    selectedCharacter: null, // Stores the selected character
    selectedColor: null,
    selectedDecoration: null,
    selectedNail: null,
    timeRemaining: 60,
    timerInterval: null,
    challengeLevel: 1,
    nailDesigns: {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
    },
    challengeReference: null, // Stores reference design for challenge mode
    activeToolCategory: null, // Keep track of the active tool category
};

// Handle selection of a tool option
function selectToolOption(categoryId, value) {
    // Get all option items
    const allOptions = document.querySelectorAll(".option-item");

    // Handle different tool categories
    if (categoryId === "baseColors" || categoryId === "pastelColors") {
        // It's a color selection
        gameState.selectedColor = value;
        gameState.selectedDecoration = null;

        // Update UI to show selected option
        allOptions.forEach((option) => {
            if (option.dataset.optionValue === value) {
                option.classList.add("selected");
            } else {
                option.classList.remove("selected");
            }
        });
    } else {
        // It's a decoration selection
        gameState.selectedDecoration = value;
        gameState.selectedColor = null;

        // Update UI to show selected option
        allOptions.forEach((option) => {
            if (option.dataset.optionValue === value) {
                option.classList.add("selected");
            } else {
                option.classList.remove("selected");
            }
        });
    }
}

// Initialize game
function initGame() {
    createToolsPanel();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Mode selection
    freestyleButton.addEventListener("click", () =>
        showCharacterSelection("freestyle")
    );
    challengeButton.addEventListener("click", () =>
        showCharacterSelection("challenge")
    );

    // Character selection
    characterOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const characterId = option.dataset.character;
            selectCharacter(characterId);
        });
    });

    // Back button
    backToModeButton.addEventListener("click", returnToModeSelection);

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

// Show character selection screen
function showCharacterSelection(mode) {
    gameState.currentMode = mode;
    mainMenu.style.display = "none";
    characterSelection.style.display = "flex";
}

// Handle character selection
function selectCharacter(characterId) {
    gameState.selectedCharacter = characterId;
    characterSelection.style.display = "none";
    startGame(gameState.currentMode);
}

// Return to mode selection
function returnToModeSelection() {
    characterSelection.style.display = "none";
    mainMenu.style.display = "flex";
    gameState.currentMode = null;
    gameState.selectedCharacter = null;
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

    // Update reference nails
    for (let i = 1; i <= 5; i++) {
        const refNail = document.getElementById(`ref-nail-${i}`);
        if (refNail) {
            // Apply color
            refNail.style.backgroundColor =
                challenge.design[i].color || "#ffdee7";

            // Apply decoration
            if (challenge.design[i].decoration) {
                refNail.className = `reference-nail ${challenge.design[i].decoration}`;
            } else {
                refNail.className = "reference-nail";
            }
        }
    }

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

// Apply design to nail
function applyDesign(nail) {
    const nailId = nail.id.split("-")[1];

    if (gameState.selectedColor) {
        nail.style.backgroundColor = gameState.selectedColor;
        gameState.nailDesigns[nailId].color = gameState.selectedColor;
    }

    if (gameState.selectedDecoration) {
        // Remove any existing decoration classes
        nail.classList.forEach((className) => {
            if (
                className.startsWith("pattern-") ||
                className.startsWith("glitter-") ||
                className.startsWith("sticker-") ||
                className.startsWith("gem-")
            ) {
                nail.classList.remove(className);
            }
        });

        // Add the new decoration class
        nail.classList.add(gameState.selectedDecoration);
        gameState.nailDesigns[nailId].decoration = gameState.selectedDecoration;
    }
}

// Reset nail design
function resetDesign() {
    nails.forEach((nail) => {
        const nailId = nail.id.split("-")[1];

        nail.style.backgroundColor = "#ffdee7";

        // Remove any decoration classes
        nail.classList.forEach((className) => {
            if (
                className.startsWith("pattern-") ||
                className.startsWith("glitter-") ||
                className.startsWith("sticker-") ||
                className.startsWith("gem-")
            ) {
                nail.classList.remove(className);
            }
        });

        gameState.nailDesigns[nailId] = {};
    });

    // Clear any selected tools
    document.querySelectorAll(".option-item").forEach((option) => {
        option.classList.remove("selected");
    });

    gameState.selectedColor = null;
    gameState.selectedDecoration = null;
}

// Return to main menu
function returnToMainMenu() {
    clearInterval(gameState.timerInterval);
    gameArea.style.display = "none";
    mainMenu.style.display = "flex";
    characterSelection.style.display = "none";

    // Hide options container when returning to menu
    const optionsContainer = document.getElementById("options-container");
    if (optionsContainer) {
        optionsContainer.style.display = "none";
        optionsContainer.innerHTML = "";
    }

    // Remove active class from category buttons
    document.querySelectorAll(".category-button").forEach((button) => {
        button.classList.remove("active");
    });

    gameState.activeToolCategory = null;
    gameState.currentMode = null;
    gameState.selectedCharacter = null;
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

// Tool categories and options
const toolCategories = [
    {
        id: "baseColors",
        name: "Base Colors",
        icon: "img/tools/base-colors.png",
        options: [
            { id: "baseColor1", value: "#FF0000", icon: "img/colors/red.png" },
            {
                id: "baseColor2",
                value: "#FFA500",
                icon: "img/colors/orange.png",
            },
            {
                id: "baseColor3",
                value: "#FFFF00",
                icon: "img/colors/yellow.png",
            },
            {
                id: "baseColor4",
                value: "#00FF00",
                icon: "img/colors/green.png",
            },
            { id: "baseColor5", value: "#0000FF", icon: "img/colors/blue.png" },
        ],
    },
    {
        id: "pastelColors",
        name: "Pastel",
        icon: "img/tools/pastel-colors.png",
        options: [
            {
                id: "pastelColor1",
                value: "#FFB6C1",
                icon: "img/colors/pastel-pink.png",
            },
            {
                id: "pastelColor2",
                value: "#FFD700",
                icon: "img/colors/pastel-yellow.png",
            },
            {
                id: "pastelColor3",
                value: "#98FB98",
                icon: "img/colors/pastel-green.png",
            },
            {
                id: "pastelColor4",
                value: "#ADD8E6",
                icon: "img/colors/pastel-blue.png",
            },
            {
                id: "pastelColor5",
                value: "#DDA0DD",
                icon: "img/colors/pastel-purple.png",
            },
        ],
    },
    {
        id: "glitterColors",
        name: "Glitter",
        icon: "img/tools/glitter.png",
        options: [
            {
                id: "glitter1",
                value: "glitter-gold",
                icon: "img/decorations/glitter-gold.png",
            },
            {
                id: "glitter2",
                value: "glitter-silver",
                icon: "img/decorations/glitter-silver.png",
            },
            {
                id: "glitter3",
                value: "glitter-rainbow",
                icon: "img/decorations/glitter-rainbow.png",
            },
            {
                id: "glitter4",
                value: "glitter-blue",
                icon: "img/decorations/glitter-blue.png",
            },
            {
                id: "glitter5",
                value: "glitter-pink",
                icon: "img/decorations/glitter-pink.png",
            },
        ],
    },
    {
        id: "patterns",
        name: "Patterns",
        icon: "img/tools/patterns.png",
        options: [
            {
                id: "pattern1",
                value: "pattern-stripes",
                icon: "img/decorations/pattern-stripes.png",
            },
            {
                id: "pattern2",
                value: "pattern-dots",
                icon: "img/decorations/pattern-dots.png",
            },
            {
                id: "pattern3",
                value: "pattern-zigzag",
                icon: "img/decorations/pattern-zigzag.png",
            },
            {
                id: "pattern4",
                value: "pattern-leopard",
                icon: "img/decorations/pattern-leopard.png",
            },
            {
                id: "pattern5",
                value: "pattern-marble",
                icon: "img/decorations/pattern-marble.png",
            },
        ],
    },
    {
        id: "stickers",
        name: "Stickers",
        icon: "img/tools/stickers.png",
        options: [
            {
                id: "sticker1",
                value: "sticker-heart",
                icon: "img/decorations/sticker-heart.png",
            },
            {
                id: "sticker2",
                value: "sticker-star",
                icon: "img/decorations/sticker-star.png",
            },
            {
                id: "sticker3",
                value: "sticker-flower",
                icon: "img/decorations/sticker-flower.png",
            },
            {
                id: "sticker4",
                value: "sticker-butterfly",
                icon: "img/decorations/sticker-butterfly.png",
            },
            {
                id: "sticker5",
                value: "sticker-diamond",
                icon: "img/decorations/sticker-diamond.png",
            },
        ],
    },
    {
        id: "gems",
        name: "Gems",
        icon: "img/tools/gems.png",
        options: [
            {
                id: "gem1",
                value: "gem-round",
                icon: "img/decorations/gem-round.png",
            },
            {
                id: "gem2",
                value: "gem-square",
                icon: "img/decorations/gem-square.png",
            },
            {
                id: "gem3",
                value: "gem-teardrop",
                icon: "img/decorations/gem-teardrop.png",
            },
            {
                id: "gem4",
                value: "gem-heart",
                icon: "img/decorations/gem-heart.png",
            },
            {
                id: "gem5",
                value: "gem-star",
                icon: "img/decorations/gem-star.png",
            },
        ],
    },
];

// Challenge designs
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
            1: { color: "#FF69B4", decoration: "sticker-heart" },
            2: { color: "#FF69B4", decoration: null },
            3: { color: "#FF69B4", decoration: "sticker-heart" },
            4: { color: "#FF69B4", decoration: null },
            5: { color: "#FF69B4", decoration: "sticker-heart" },
        },
    },
];

// DOM Elements
const mainMenu = document.getElementById("main-menu");
const characterSelection = document.getElementById("character-selection");
const gameArea = document.getElementById("game-area");
const freestyleButton = document.getElementById("freestyle-button");
const challengeButton = document.getElementById("challenge-button");
const backToModeButton = document.getElementById("back-to-mode");
const characterOptions = document.querySelectorAll(".character-option");
const nails = document.querySelectorAll(".nail");
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

// Create and insert horizontal tools panel
function createToolsPanel() {
    const toolsPanel = document.getElementById("tools-panel");
    toolsPanel.className = "horizontal-tools-panel";

    // Create category buttons
    toolCategories.forEach((category) => {
        const categoryButton = document.createElement("div");
        categoryButton.className = "category-button";
        categoryButton.dataset.categoryId = category.id;

        const icon = document.createElement("div");
        icon.className = "category-icon";
        icon.style.backgroundImage = `url(${category.icon})`;

        const name = document.createElement("div");
        name.className = "category-name";
        name.textContent = category.name;

        categoryButton.appendChild(icon);
        categoryButton.appendChild(name);
        toolsPanel.appendChild(categoryButton);
    });
}

// Toggle options for a category
function toggleCategoryOptions(categoryId) {
    const optionsContainer = document.getElementById("options-container");
    const allCategoryButtons = document.querySelectorAll(".category-button");

    if (gameState.activeToolCategory === categoryId) {
        optionsContainer.style.display = "none";
        gameState.activeToolCategory = null;
        allCategoryButtons.forEach((button) =>
            button.classList.remove("active")
        );
    } else {
        const category = toolCategories.find((cat) => cat.id === categoryId);
        if (!category) return;

        optionsContainer.innerHTML = "";
        optionsContainer.style.display = "flex";
        gameState.activeToolCategory = categoryId;

        allCategoryButtons.forEach((button) => {
            if (button.dataset.categoryId === categoryId) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });

        category.options.forEach((option) => {
            const optionElement = document.createElement("div");
            optionElement.className = "option-item";
            optionElement.dataset.optionId = option.id;
            optionElement.dataset.optionValue = option.value;

            const icon = document.createElement("div");
            icon.className = "option-icon";
            icon.style.backgroundImage = `url(${option.icon})`;

            optionElement.appendChild(icon);
            optionElement.addEventListener("click", () => {
                selectToolOption(categoryId, option.value);
            });

            optionsContainer.appendChild(optionElement);
        });
    }
}
