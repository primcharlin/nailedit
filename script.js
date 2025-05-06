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
    characterCustomization: {
        name: '', // character name
        skinTone: 'skin02', // default skin tone
        hairStyle: 'bun', // default hair style
        eyeColor: 'brown', // default eye color
    },
    bgMusic: null, // Background music element
    isMusicPlaying: false // Track if music is playing
};

// Character customization options
const characterCustomization = {
    skinTones: [
        { id: 'skin01', name: 'Light' },
        { id: 'skin02', name: 'Medium Light' },
        { id: 'skin03', name: 'Medium Dark' },
        { id: 'skin04', name: 'Dark' }
    ],
    hairStyles: [
        { id: 'bun', name: 'Bun' },
        { id: 'short', name: 'Short' },
        { id: 'long', name: 'Long' }
    ],
    eyeColors: [
        { id: 'green', name: 'Green' },
        { id: 'blue', name: 'Blue' },
        { id: 'brown', name: 'Brown' }
    ]
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
    initBackgroundMusic();
    playBackgroundMusic(); // Start playing music when game initializes
}

// Play mouse click sound
function playClickSound() {
    const clickSound = new Audio('sound/mouse_click.mp3');
    clickSound.play();
}

// Setup event listeners
function setupEventListeners() {
    // Mode selection
    freestyleButton.addEventListener("click", () => {
        playClickSound();
        showCharacterSelection("freestyle");
    });
    challengeButton.addEventListener("click", () => {
        playClickSound();
        showCharacterSelection("challenge");
    });

    // Character selection
    characterOptions.forEach((option) => {
        option.addEventListener("click", () => {
            playClickSound();
            const characterId = option.dataset.character;
            selectCharacter(characterId);
        });
    });

    // Back button
    backToModeButton.addEventListener("click", () => {
        playClickSound();
        returnToModeSelection();
    });

    // Nail selection
    nails.forEach((nail) => {
        nail.addEventListener("click", () => {
            applyDesign(nail);
        });
    });

    // Control buttons
    resetButton.addEventListener("click", () => {
        playClickSound();
        resetDesign();
    });
    backButton.addEventListener("click", () => {
        playClickSound();
        returnToMainMenu();
    });
    doneButton.addEventListener("click", () => {
        playClickSound();
        completeDesign();
    });

    // Modal buttons
    tryAgainButton.addEventListener("click", () => {
        playClickSound();
        resultModal.style.display = "none";
        startGame("challenge");
    });

    menuButton.addEventListener("click", () => {
        playClickSound();
        resultModal.style.display = "none";
        returnToMainMenu();
    });
}

// Show character selection screen
function showCharacterSelection(mode) {
    gameState.currentMode = mode;
    mainMenu.style.display = "none";
    characterSelection.style.display = "flex";

    // Add customization option if it doesn't exist
    let characterGrid = document.querySelector('.character-grid');
    if (!document.querySelector('.custom-character-option')) {
        const customOption = document.createElement('div');
        customOption.className = 'character-option custom-character-option';
        customOption.innerHTML = `
            <img src="img/avatar_skin01-long-brown.png" alt="Custom Character">
            <p>Create Custom</p>
        `;
        characterGrid.appendChild(customOption);

        // Add click event for custom character option
        customOption.addEventListener('click', () => {
            document.querySelector('.character-grid').style.display = 'none';
            document.querySelector('.character-customization').style.display = 'flex';
        });

        // Create customization UI if it doesn't exist
        if (!document.querySelector('.character-customization')) {
            const customizationUI = document.createElement('div');
            customizationUI.className = 'character-customization';
            customizationUI.style.display = 'none';
            customizationUI.innerHTML = `
                <h2>Customize Your Character</h2>
                <div class="customization-preview">
                    <img id="character-preview" src="img/avatar_skin01-long-brown.png" alt="Character Preview">
                </div>
                <div class="name-input-container">
                    <h3>Character Name</h3>
                    <input type="text" id="character-name" placeholder="Enter character name" maxlength="20">
                </div>
                <div class="customization-options">
                    <div class="option-group">
                        <h3>Skin Tone</h3>
                        <div class="options-row" id="skin-options">
                            ${characterCustomization.skinTones.map(skin => `
                                <button class="option-btn ${skin.id === gameState.characterCustomization.skinTone ? 'selected' : ''}" 
                                        data-type="skinTone" 
                                        data-value="${skin.id}">
                                    ${skin.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="option-group">
                        <h3>Hair Style</h3>
                        <div class="options-row" id="hair-options">
                            ${characterCustomization.hairStyles.map(hair => `
                                <button class="option-btn ${hair.id === gameState.characterCustomization.hairStyle ? 'selected' : ''}" 
                                        data-type="hairStyle" 
                                        data-value="${hair.id}">
                                    ${hair.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="option-group">
                        <h3>Eye Color</h3>
                        <div class="options-row" id="eye-options">
                            ${characterCustomization.eyeColors.map(eye => `
                                <button class="option-btn ${eye.id === gameState.characterCustomization.eyeColor ? 'selected' : ''}" 
                                        data-type="eyeColor" 
                                        data-value="${eye.id}">
                                    ${eye.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="customization-buttons">
                    <button id="back-to-characters" class="secondary-btn">Back</button>
                    <button id="create-character" class="create-btn">Create Character</button>
                </div>
            `;
            characterSelection.appendChild(customizationUI);

            // Add event listeners for customization options
            setupCustomizationListeners();

            // Add back button listener
            document.getElementById('back-to-characters').addEventListener('click', () => {
                playClickSound();
                document.querySelector('.character-customization').style.display = 'none';
                document.querySelector('.character-grid').style.display = 'grid';
            });

            // Add name input listener
            document.getElementById('character-name').addEventListener('input', (e) => {
                gameState.characterCustomization.name = e.target.value;
            });
        }
    }
}

// Setup customization event listeners
function setupCustomizationListeners() {
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            playClickSound();
            const type = e.target.dataset.type;
            const value = e.target.dataset.value;
            
            // Update selected state in UI
            document.querySelectorAll(`[data-type="${type}"]`).forEach(btn => {
                btn.classList.remove('selected');
            });
            e.target.classList.add('selected');
            
            // Update game state
            gameState.characterCustomization[type] = value;
            
            // Update preview image
            updateCharacterPreview();
        });
    });

    // Create character button
    const createButton = document.getElementById('create-character');
    createButton.addEventListener('click', () => {
        playClickSound();
        selectCustomCharacter();
    });

    // Add back button listener
    document.getElementById('back-to-characters').addEventListener('click', () => {
        playClickSound();
        document.querySelector('.character-customization').style.display = 'none';
        document.querySelector('.character-grid').style.display = 'grid';
    });
}

// Update character preview based on current customization
function updateCharacterPreview() {
    const { skinTone, hairStyle, eyeColor } = gameState.characterCustomization;
    const previewImg = document.getElementById('character-preview');
    previewImg.src = `img/avatar_${skinTone}-${hairStyle}-${eyeColor}.png`;
}

// Handle custom character selection
function selectCustomCharacter() {
    const { name, skinTone, hairStyle, eyeColor } = gameState.characterCustomization;
    
    // Validate name
    if (!name.trim()) {
        alert('Please enter a character name');
        return;
    }
    
    gameState.selectedCharacter = 'custom';
    characterSelection.style.display = "none";

    // Display the customized character in the game area
    const characterDisplay = document.getElementById("character-display");
    characterDisplay.innerHTML = `
        <div class="character-container">
            <img src="img/avatar_${skinTone}-${hairStyle}-${eyeColor}.png" alt="Custom Character">
            <p class="character-name">${name}</p>
        </div>
    `;

    startGame(gameState.currentMode);
}

// Handle character selection
function selectCharacter(characterId) {
    gameState.selectedCharacter = characterId;
    characterSelection.style.display = "none";

    // Display the selected character in the game area
    const characterDisplay = document.getElementById("character-display");
    const selectedCharacter = document.querySelector(
        `.character-option[data-character="${characterId}"] img`
    );
    if (selectedCharacter) {
        characterDisplay.innerHTML = `<img src="${selectedCharacter.src}" alt="Selected Character">`;
    }

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
        pauseBackgroundMusic(); // Pause music in challenge mode
        startChallengeMode();
    } else {
        playBackgroundMusic(); // Play music in freestyle mode
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

    // Clear character display
    const characterDisplay = document.getElementById("character-display");
    characterDisplay.innerHTML = "";

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
    
    // Resume background music when returning to main menu
    playBackgroundMusic();
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
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#ff6b9a"/></svg>',
        options: [
            {
                id: "baseColor1",
                value: "#FF0000",
                display:
                    '<div class="color-preview" style="background-color: #FF0000;"></div>',
            },
            {
                id: "baseColor2",
                value: "#FFA500",
                display:
                    '<div class="color-preview" style="background-color: #FFA500;"></div>',
            },
            {
                id: "baseColor3",
                value: "#FFFF00",
                display:
                    '<div class="color-preview" style="background-color: #FFFF00;"></div>',
            },
            {
                id: "baseColor4",
                value: "#00FF00",
                display:
                    '<div class="color-preview" style="background-color: #00FF00;"></div>',
            },
            {
                id: "baseColor5",
                value: "#0000FF",
                display:
                    '<div class="color-preview" style="background-color: #0000FF;"></div>',
            },
        ],
    },
    {
        id: "pastelColors",
        name: "Pastel Colors",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#FFC0CB"/></svg>',
        options: [
            {
                id: "pastelColor1",
                value: "#FFB6C1",
                display:
                    '<div class="color-preview" style="background-color: #FFB6C1;"></div>',
            },
            {
                id: "pastelColor2",
                value: "#FFD700",
                display:
                    '<div class="color-preview" style="background-color: #FFD700;"></div>',
            },
            {
                id: "pastelColor3",
                value: "#98FB98",
                display:
                    '<div class="color-preview" style="background-color: #98FB98;"></div>',
            },
            {
                id: "pastelColor4",
                value: "#ADD8E6",
                display:
                    '<div class="color-preview" style="background-color: #ADD8E6;"></div>',
            },
            {
                id: "pastelColor5",
                value: "#DDA0DD",
                display:
                    '<div class="color-preview" style="background-color: #DDA0DD;"></div>',
            },
        ],
    },
    {
        id: "glitterColors",
        name: "Glitter",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3L13.5 8.5H19L14.5 12L16 17.5L12 14L8 17.5L9.5 12L5 8.5H10.5L12 3Z" fill="#FFD700"/></svg>',
        options: [
            {
                id: "glitter1",
                value: "glitter-gold",
                display: '<div class="deco-preview glitter-gold"></div>',
            },
            {
                id: "glitter2",
                value: "glitter-silver",
                display: '<div class="deco-preview glitter-silver"></div>',
            },
            {
                id: "glitter3",
                value: "glitter-rainbow",
                display: '<div class="deco-preview glitter-rainbow"></div>',
            },
            {
                id: "glitter4",
                value: "glitter-blue",
                display: '<div class="deco-preview glitter-blue"></div>',
            },
            {
                id: "glitter5",
                value: "glitter-pink",
                display: '<div class="deco-preview glitter-pink"></div>',
            },
        ],
    },
    {
        id: "patterns",
        name: "Patterns",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="6" width="18" height="3" fill="#ff6b9a"/><rect x="3" y="12" width="18" height="3" fill="#ff6b9a"/><rect x="3" y="18" width="18" height="3" fill="#ff6b9a"/></svg>',
        options: [
            {
                id: "pattern1",
                value: "pattern-stripes",
                display: '<div class="deco-preview pattern-stripes"></div>',
            },
            {
                id: "pattern2",
                value: "pattern-dots",
                display: '<div class="deco-preview pattern-dots"></div>',
            },
            {
                id: "pattern3",
                value: "pattern-zigzag",
                display: '<div class="deco-preview pattern-zigzag"></div>',
            },
            {
                id: "pattern4",
                value: "pattern-leopard",
                display: '<div class="deco-preview pattern-leopard"></div>',
            },
            {
                id: "pattern5",
                value: "pattern-marble",
                display: '<div class="deco-preview pattern-marble"></div>',
            },
        ],
    },
    {
        id: "stickers",
        name: "Stickers",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff6b9a"/></svg>',
        options: [
            {
                id: "sticker1",
                value: "sticker-heart",
                display: '<div class="deco-preview sticker-heart"></div>',
            },
            {
                id: "sticker2",
                value: "sticker-star",
                display: '<div class="deco-preview sticker-star"></div>',
            },
            {
                id: "sticker3",
                value: "sticker-flower",
                display: '<div class="deco-preview sticker-flower"></div>',
            },
            {
                id: "sticker4",
                value: "sticker-butterfly",
                display: '<div class="deco-preview sticker-butterfly"></div>',
            },
            {
                id: "sticker5",
                value: "sticker-diamond",
                display: '<div class="deco-preview sticker-diamond"></div>',
            },
        ],
    },
    {
        id: "gems",
        name: "Gems",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L4 10l8 12 8-12-8-8z" fill="#00FFFF"/></svg>',
        options: [
            {
                id: "gem1",
                value: "gem-round",
                display: '<div class="deco-preview gem-round"></div>',
            },
            {
                id: "gem2",
                value: "gem-square",
                display: '<div class="deco-preview gem-square"></div>',
            },
            {
                id: "gem3",
                value: "gem-teardrop",
                display: '<div class="deco-preview gem-teardrop"></div>',
            },
            {
                id: "gem4",
                value: "gem-heart",
                display: '<div class="deco-preview gem-heart"></div>',
            },
            {
                id: "gem5",
                value: "gem-star",
                display: '<div class="deco-preview gem-star"></div>',
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

// Create and insert horizontal tools panel to replace the existing one
function createToolsPanel() {
    // Get the existing tools panel to replace it
    const existingToolsPanel = document.getElementById("tools-panel");
    if (!existingToolsPanel) return;

    // Create new horizontal tools panel
    const horizontalToolsPanel = document.createElement("div");
    horizontalToolsPanel.id = "tools-panel";
    horizontalToolsPanel.className = "horizontal-tools-panel";

    // Create main category buttons
    const categoryBar = document.createElement("div");
    categoryBar.className = "category-bar";

    // Create options container (initially hidden)
    const optionsContainer = document.createElement("div");
    optionsContainer.id = "options-container";
    optionsContainer.className = "options-container";

    // Add category buttons to the category bar
    toolCategories.forEach((category) => {
        const categoryButton = document.createElement("div");
        categoryButton.className = "category-button";
        categoryButton.dataset.categoryId = category.id;
        categoryButton.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
        `;

        // Add click event to show options for this category
        categoryButton.addEventListener("click", () => {
            playClickSound();
            toggleCategoryOptions(category.id);
        });

        categoryBar.appendChild(categoryButton);
    });

    // Append elements to tools panel
    horizontalToolsPanel.appendChild(categoryBar);
    horizontalToolsPanel.appendChild(optionsContainer);

    // Replace existing tools panel with the new one
    existingToolsPanel.parentNode.replaceChild(
        horizontalToolsPanel,
        existingToolsPanel
    );
}

// Toggle options for a category
function toggleCategoryOptions(categoryId) {
    playClickSound();
    const optionsContainer = document.getElementById("options-container");
    const allCategoryButtons = document.querySelectorAll(".category-button");

    // If clicking the same category, toggle its visibility
    if (gameState.activeToolCategory === categoryId) {
        // Hide options
        optionsContainer.innerHTML = "";
        optionsContainer.style.display = "none";
        gameState.activeToolCategory = null;

        // Remove active class from all category buttons
        allCategoryButtons.forEach((button) => {
            button.classList.remove("active");
        });
    } else {
        // Show options for the selected category
        const category = toolCategories.find((cat) => cat.id === categoryId);
        if (!category) return;

        // Update active category
        gameState.activeToolCategory = categoryId;

        // Update active button styling
        allCategoryButtons.forEach((button) => {
            if (button.dataset.categoryId === categoryId) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });

        // Clear and populate options container
        optionsContainer.innerHTML = "";
        optionsContainer.style.display = "flex";

        // Create options for this category
        category.options.forEach((option) => {
            const optionElement = document.createElement("div");
            optionElement.className = "option-item";
            optionElement.dataset.optionId = option.id;
            optionElement.dataset.optionValue = option.value;
            optionElement.innerHTML = option.display;

            // Add click event for this option
            optionElement.addEventListener("click", () => {
                playClickSound();
                selectToolOption(categoryId, option.value);
            });

            optionsContainer.appendChild(optionElement);
        });
    }
}

// Initialize background music
function initBackgroundMusic() {
    gameState.bgMusic = new Audio('sound/bgm-light.mp3');
    gameState.bgMusic.loop = true;
    gameState.bgMusic.volume = 0.5; // Set volume to 50%
}

// Play background music
function playBackgroundMusic() {
    if (gameState.bgMusic && !gameState.isMusicPlaying) {
        gameState.bgMusic.play();
        gameState.isMusicPlaying = true;
    }
}

// Pause background music
function pauseBackgroundMusic() {
    if (gameState.bgMusic && gameState.isMusicPlaying) {
        gameState.bgMusic.pause();
        gameState.isMusicPlaying = false;
    }
}
