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
        name: "", // character name
        skinTone: "skin02", // default skin tone
        hairStyle: "bun", // default hair style
        eyeColor: "brown", // default eye color
    },
    bgMusic: null, // Background music element
    isMusicPlaying: false, // Track if music is playing
};

// Character customization options
const characterCustomization = {
    skinTones: [
        { id: "skin01", name: "Light" },
        { id: "skin02", name: "Medium Light" },
        { id: "skin03", name: "Medium Dark" },
        { id: "skin04", name: "Dark" },
    ],
    hairStyles: [
        { id: "bun", name: "Bun" },
        { id: "short", name: "Short" },
        { id: "long", name: "Long" },
    ],
    eyeColors: [
        { id: "green", name: "Green" },
        { id: "blue", name: "Blue" },
        { id: "brown", name: "Brown" },
    ],
};

// Handle selection of a tool option
function selectToolOption(categoryId, value) {
    // Get all option items
    const allOptions = document.querySelectorAll(".option-item");

    // Handle different tool categories
    if (
        categoryId === "baseColors" ||
        categoryId === "pastelColors" ||
        categoryId === "fancyColors"
    ) {
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
    initCustomCursor(); // Initialize custom cursor
}

// Initialize custom cursor
function initCustomCursor() {
    // Create cursor element
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    // Update cursor position on mouse move
    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });

    // Hide cursor when mouse leaves window
    document.addEventListener("mouseleave", () => {
        cursor.style.display = "none";
    });

    // Show cursor when mouse enters window
    document.addEventListener("mouseenter", () => {
        cursor.style.display = "block";
    });
}

// Play mouse click sound
function playClickSound() {
    const clickSound = new Audio("sound/mouse_click.mp3");
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

    // Corner reset button
    const cornerResetButton = document.getElementById("corner-reset-button");
    if (cornerResetButton) {
        cornerResetButton.addEventListener("click", resetDesign);
    }

    document.body.addEventListener(
        "click",
        () => {
            if (!gameState.isMusicPlaying) {
                playBackgroundMusic();
            }
        },
        { once: true }
    );
}

// Show character selection screen
function showCharacterSelection(mode) {
    gameState.currentMode = mode;
    mainMenu.style.display = "none";
    characterSelection.style.display = "flex";

    // Add customization option if it doesn't exist
    let characterGrid = document.querySelector(".character-grid");
    if (!document.querySelector(".custom-character-option")) {
        const customOption = document.createElement("div");
        customOption.className = "character-option custom-character-option";
        customOption.innerHTML = `
            <img src="img/avatar_skin01-long-brown.png" alt="Custom Character">
            <p>Create Custom</p>
        `;
        characterGrid.appendChild(customOption);

        // Add click event for custom character option
        customOption.addEventListener("click", () => {
            document.querySelector(".character-grid").style.display = "none";
            document.querySelector(".character-customization").style.display =
                "flex";
        });

        // Create customization UI if it doesn't exist
        if (!document.querySelector(".character-customization")) {
            const customizationUI = document.createElement("div");
            customizationUI.className = "character-customization";
            customizationUI.style.display = "none";
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
                            ${characterCustomization.skinTones
                                .map(
                                    (skin) => `
                                <button class="option-btn ${
                                    skin.id ===
                                    gameState.characterCustomization.skinTone
                                        ? "selected"
                                        : ""
                                }" 
                                        data-type="skinTone" 
                                        data-value="${skin.id}">
                                    ${skin.name}
                                </button>
                            `
                                )
                                .join("")}
                        </div>
                    </div>
                    <div class="option-group">
                        <h3>Hair Style</h3>
                        <div class="options-row" id="hair-options">
                            ${characterCustomization.hairStyles
                                .map(
                                    (hair) => `
                                <button class="option-btn ${
                                    hair.id ===
                                    gameState.characterCustomization.hairStyle
                                        ? "selected"
                                        : ""
                                }" 
                                        data-type="hairStyle" 
                                        data-value="${hair.id}">
                                    ${hair.name}
                                </button>
                            `
                                )
                                .join("")}
                        </div>
                    </div>
                    <div class="option-group">
                        <h3>Eye Color</h3>
                        <div class="options-row" id="eye-options">
                            ${characterCustomization.eyeColors
                                .map(
                                    (eye) => `
                                <button class="option-btn ${
                                    eye.id ===
                                    gameState.characterCustomization.eyeColor
                                        ? "selected"
                                        : ""
                                }" 
                                        data-type="eyeColor" 
                                        data-value="${eye.id}">
                                    ${eye.name}
                                </button>
                            `
                                )
                                .join("")}
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
            document
                .getElementById("back-to-characters")
                .addEventListener("click", () => {
                    playClickSound();
                    document.querySelector(
                        ".character-customization"
                    ).style.display = "none";
                    document.querySelector(".character-grid").style.display =
                        "grid";
                });

            // Add name input listener
            document
                .getElementById("character-name")
                .addEventListener("input", (e) => {
                    gameState.characterCustomization.name = e.target.value;
                });
        }
    }
}

// Setup customization event listeners
function setupCustomizationListeners() {
    const optionButtons = document.querySelectorAll(".option-btn");
    optionButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            playClickSound();
            const type = e.target.dataset.type;
            const value = e.target.dataset.value;

            // Update selected state in UI
            document
                .querySelectorAll(`[data-type="${type}"]`)
                .forEach((btn) => {
                    btn.classList.remove("selected");
                });
            e.target.classList.add("selected");

            // Update game state
            gameState.characterCustomization[type] = value;

            // Update preview image
            updateCharacterPreview();
        });
    });

    // Create character button
    const createButton = document.getElementById("create-character");
    createButton.addEventListener("click", () => {
        playClickSound();
        selectCustomCharacter();
    });

    // Add back button listener
    document
        .getElementById("back-to-characters")
        .addEventListener("click", () => {
            playClickSound();
            document.querySelector(".character-customization").style.display =
                "none";
            document.querySelector(".character-grid").style.display = "grid";
        });
}

// Update character preview based on current customization
function updateCharacterPreview() {
    const { skinTone, hairStyle, eyeColor } = gameState.characterCustomization;
    const previewImg = document.getElementById("character-preview");
    previewImg.src = `img/avatar_${skinTone}-${hairStyle}-${eyeColor}.png`;
}

// Handle custom character selection
function selectCustomCharacter() {
    const { name, skinTone, hairStyle, eyeColor } = gameState.characterCustomization;

    // Validate name
    if (!name.trim()) {
        alert("Please enter a character name");
        return;
    }

    gameState.selectedCharacter = "custom";
    characterSelection.style.display = "none";

    // Always show neutral face at the start
    const characterDisplay = document.getElementById("character-display");
    let imgSrc = `img/avatar_${skinTone}-${hairStyle}-${eyeColor}.png`;

    characterDisplay.innerHTML = `
        <div class="character-container">
            <img src="${imgSrc}" alt="Custom Character">
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
        startChallengeMode();
        playBackgroundMusic(); // Play challenge music
    } else {
        playBackgroundMusic(); // Play light music
        challengeUI.style.display = "none";
    }
}

// Challenge designs generator
function generateRandomChallenge(level) {
    // Use only the colors from our color options
    const baseColors = [
        "#e83f29",
        "#ed7235",
        "#fff143",
        "#aed03b",
        "#9ac4e9",
        "#000000",
    ];
    const pastelColors = [
        "#FFB6C1",
        "#FFD700",
        "#98FB98",
        "#ADD8E6",
        "#DDA0DD",
    ];
    const fancyColors = [
        "fancyColor1",
        "fancyColor2",
        "fancyColor3",
        "fancyColor4",
        "fancyColor5",
    ];

    const decorations = [
        null,
        "sticker-heart",
        "sticker-star",
        "sticker-flower",
        "sticker-butterfly",
        "sticker-diamond",
        "pattern-stripes",
        "pattern-dots",
        "pattern-coffee-leopard",
        "pattern-flowers",
        "pattern-plaid",
        "gem1",
        "gem2",
        "gem3",
        "gem4",
    ];

    const design = {};
    const usedColors = new Set();
    const usedDecorations = new Set();

    // Generate design based on level
    for (let i = 1; i <= 5; i++) {
        let color, decoration;

        // Level 1: Mix of base and pastel colors, no decorations
        if (level === 1) {
            const colorType = Math.random();
            if (colorType < 0.5) {
                color =
                    baseColors[Math.floor(Math.random() * baseColors.length)];
            } else {
                color =
                    pastelColors[
                        Math.floor(Math.random() * pastelColors.length)
                    ];
            }
            decoration = null;
        }
        // Level 2: Mix of all colors + simple stickers
        else if (level === 2) {
            const colorType = Math.random();
            if (colorType < 0.4) {
                color =
                    baseColors[Math.floor(Math.random() * baseColors.length)];
            } else if (colorType < 0.7) {
                color =
                    pastelColors[
                        Math.floor(Math.random() * pastelColors.length)
                    ];
            } else {
                color =
                    fancyColors[Math.floor(Math.random() * fancyColors.length)];
            }
            decoration =
                Math.random() < 0.5
                    ? decorations[Math.floor(Math.random() * 5) + 1]
                    : null; // Only stickers
        }
        // Level 3: Mix of all colors + stickers and patterns
        else if (level === 3) {
            const colorType = Math.random();
            if (colorType < 0.3) {
                color =
                    baseColors[Math.floor(Math.random() * baseColors.length)];
            } else if (colorType < 0.6) {
                color =
                    pastelColors[
                        Math.floor(Math.random() * pastelColors.length)
                    ];
            } else {
                color =
                    fancyColors[Math.floor(Math.random() * fancyColors.length)];
            }
            decoration =
                Math.random() < 0.7
                    ? decorations[Math.floor(Math.random() * 10) + 1]
                    : null; // Stickers and patterns
        }
        // Level 4: More fancy colors + all decorations
        else if (level === 4) {
            const colorType = Math.random();
            if (colorType < 0.2) {
                color =
                    baseColors[Math.floor(Math.random() * baseColors.length)];
            } else if (colorType < 0.4) {
                color =
                    pastelColors[
                        Math.floor(Math.random() * pastelColors.length)
                    ];
            } else {
                color =
                    fancyColors[Math.floor(Math.random() * fancyColors.length)];
            }
            decoration =
                decorations[Math.floor(Math.random() * decorations.length)]; // All decorations
        }
        // Level 5: Mostly fancy colors + complex combinations
        else {
            // Ensure at least 2 fancy colors and 3 different decorations
            while (usedColors.size < 3 || usedDecorations.size < 3) {
                const colorType = Math.random();
                if (colorType < 0.1) {
                    color =
                        baseColors[
                            Math.floor(Math.random() * baseColors.length)
                        ];
                } else if (colorType < 0.3) {
                    color =
                        pastelColors[
                            Math.floor(Math.random() * pastelColors.length)
                        ];
                } else {
                    color =
                        fancyColors[
                            Math.floor(Math.random() * fancyColors.length)
                        ];
                }
                decoration =
                    decorations[Math.floor(Math.random() * decorations.length)];
                usedColors.add(color);
                usedDecorations.add(decoration);
            }
        }

        design[i] = { color, decoration };
    }

    return {
        level,
        image: "/api/placeholder/300/200",
        timeLimit: Math.max(35, 60 - level * 5), // Decrease time as level increases
        design,
    };
}

// Setup challenge mode
function startChallengeMode() {
    challengeUI.style.display = "block";

    // Generate a new random challenge for the current level
    const challenge = generateRandomChallenge(gameState.challengeLevel);
    gameState.challengeReference = challenge.design;
    gameState.timeRemaining = challenge.timeLimit;

    // Set reference image
    referenceImage.style.backgroundImage = `url(${challenge.image})`;

    // Update reference nails
    for (let i = 1; i <= 5; i++) {
        const refNail = document.getElementById(`ref-nail-${i}`);
        if (refNail) {
            // Reset nail styles
            refNail.style.background = "";
            refNail.style.backgroundColor = "";
            refNail.className = "reference-nail";

            // Apply color
            if (challenge.design[i].color.startsWith("fancyColor")) {
                let gradient = "";
                switch (challenge.design[i].color) {
                    case "fancyColor1":
                        gradient =
                            "linear-gradient(90deg, #a89877, #c2b7a4, #e7ded7, #948a6c, #e1d4c1, #b2a289, #b4a491)";
                        break;
                    case "fancyColor2":
                        gradient =
                            "linear-gradient(90deg, #5f5f5f, #bcbcbc, #bcbcbc, #e9e9e9, #bcbcbc, #5f5f5f)";
                        break;
                    case "fancyColor3":
                        gradient =
                            "linear-gradient(90deg, #0d1533, #18274c, #005397, #1670b9, #005397, #18274c, #0d1533)";
                        break;
                    case "fancyColor4":
                        gradient =
                            "linear-gradient(90deg, #2f0925, #4e183e, #64255b, #4e183e, #2f0925)";
                        break;
                    case "fancyColor5":
                        gradient =
                            "linear-gradient(90deg, #98a0c1, #97a4bf, #c5b2d1, #e5d1e5, #c5b2d1, #97a4bf, #98a0c1)";
                        break;
                }
                refNail.style.background = gradient;
            } else {
                refNail.style.backgroundColor = challenge.design[i].color;
            }

            // Apply decoration
            if (challenge.design[i].decoration) {
                if (challenge.design[i].decoration.startsWith("pattern-")) {
                    // Handle patterns
                    refNail.classList.add(challenge.design[i].decoration);
                    if (
                        challenge.design[i].decoration ===
                        "pattern-coffee-leopard"
                    ) {
                        const patternImg = document.createElement("img");
                        patternImg.src = "img/Patterns1.png";
                        patternImg.className = "pattern-img";
                        patternImg.style.position = "absolute";
                        patternImg.style.width = "100%";
                        patternImg.style.height = "100%";
                        patternImg.style.objectFit = "cover";
                        patternImg.style.top = "0";
                        patternImg.style.left = "0";
                        refNail.appendChild(patternImg);
                    }
                } else if (
                    challenge.design[i].decoration.startsWith("sticker-")
                ) {
                    // Handle stickers
                    if (challenge.design[i].decoration === "sticker-heart") {
                        const stickerImg = document.createElement("img");
                        stickerImg.src = "img/Sticker1.png";
                        stickerImg.className = "applied-sticker-img";
                        stickerImg.style.position = "absolute";
                        stickerImg.style.left = "50%";
                        stickerImg.style.top = "50%";
                        stickerImg.style.transform = "translate(-50%, -50%)";
                        refNail.appendChild(stickerImg);
                    } else if (
                        challenge.design[i].decoration === "sticker-diamond"
                    ) {
                        const stickerImg = document.createElement("img");
                        stickerImg.src = "img/Sticker3.png";
                        stickerImg.className = "applied-sticker-img";
                        stickerImg.style.position = "absolute";
                        stickerImg.style.left = "50%";
                        stickerImg.style.top = "50%";
                        stickerImg.style.transform = "translate(-50%, -50%)";
                        refNail.appendChild(stickerImg);
                    } else {
                        refNail.classList.add(challenge.design[i].decoration);
                    }
                } else if (challenge.design[i].decoration.startsWith("gem")) {
                    // Handle gems
                    const gemImg = document.createElement("img");
                    gemImg.src = `img/Gems${challenge.design[
                        i
                    ].decoration.slice(-1)}.png`;
                    gemImg.className = "applied-gem-img";
                    gemImg.style.position = "absolute";
                    gemImg.style.left = "50%";
                    gemImg.style.top = "50%";
                    gemImg.style.transform = "translate(-50%, -50%)";
                    refNail.appendChild(gemImg);
                }
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
        // Remove any decoration classes
        nail.classList.forEach((className) => {
            if (
                className.startsWith("pattern-") ||
                className.startsWith("glitter-")
            ) {
                nail.classList.remove(className);
            }
        });
        // Clear any gradient
        nail.style.background = "";

        // Handle fancy colors
        if (gameState.selectedColor.startsWith("fancyColor")) {
            let gradient = "";
            switch (gameState.selectedColor) {
                case "fancyColor1":
                    gradient =
                        "linear-gradient(90deg, #a89877, #c2b7a4, #e7ded7, #948a6c, #e1d4c1, #b2a289, #b4a491)";
                    break;
                case "fancyColor2":
                    gradient =
                        "linear-gradient(90deg, #5f5f5f, #bcbcbc, #bcbcbc, #e9e9e9, #bcbcbc, #5f5f5f)";
                    break;
                case "fancyColor3":
                    gradient =
                        "linear-gradient(90deg, #0d1533, #18274c, #005397, #1670b9, #005397, #18274c, #0d1533)";
                    break;
                case "fancyColor4":
                    gradient =
                        "linear-gradient(90deg, #2f0925, #4e183e, #64255b, #4e183e, #2f0925)";
                    break;
                case "fancyColor5":
                    gradient =
                        "linear-gradient(90deg, #98a0c1, #97a4bf, #c5b2d1, #e5d1e5, #c5b2d1, #97a4bf, #98a0c1)";
                    break;
            }
            nail.style.background = gradient;
            nail.style.backgroundColor = "";
            gameState.nailDesigns[nailId] = gameState.nailDesigns[nailId] || {};
            gameState.nailDesigns[nailId].color = gameState.selectedColor;
        } else {
            // Apply regular color
            nail.style.backgroundColor = gameState.selectedColor;
            gameState.nailDesigns[nailId] = gameState.nailDesigns[nailId] || {};
            gameState.nailDesigns[nailId].color = gameState.selectedColor;
        }
    }

    if (gameState.selectedDecoration) {
        // Remove any existing pattern or glitter classes
        nail.classList.forEach((className) => {
            if (
                className.startsWith("pattern-") ||
                className.startsWith("glitter-")
            ) {
                nail.classList.remove(className);
            }
        });

        // Handle stickers and gems
        if (
            gameState.selectedDecoration.startsWith("sticker-") ||
            gameState.selectedDecoration.startsWith("gem")
        ) {
            // Get click position relative to the nail
            const rect = nail.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            let element;
            // Handle stickers
            if (gameState.selectedDecoration.startsWith("sticker-")) {
                if (gameState.selectedDecoration === "sticker-heart") {
                    element = document.createElement("img");
                    element.className = "applied-sticker-img";
                    element.src = "img/Sticker1.png";
                    element.alt = "Heart Sticker";
                } else if (gameState.selectedDecoration === "sticker-diamond") {
                    element = document.createElement("img");
                    element.className = "applied-sticker-img";
                    element.src = "img/Sticker3.png";
                    element.alt = "Diamond Sticker";
                } else if (gameState.selectedDecoration === "sticker-star") {
                    element = document.createElement("div");
                    element.className = "applied-sticker-img sticker-star";
                } else if (gameState.selectedDecoration === "sticker-flower") {
                    element = document.createElement("div");
                    element.className = "applied-sticker-img sticker-flower";
                } else if (
                    gameState.selectedDecoration === "sticker-butterfly"
                ) {
                    element = document.createElement("div");
                    element.className = "applied-sticker-img sticker-butterfly";
                }
            } else {
                // Handle gems
                element = document.createElement("img");
                element.className = "applied-gem-img";
                if (gameState.selectedDecoration === "gem1") {
                    element.src = "img/Gems1.png";
                    element.alt = "Gem 1";
                } else if (gameState.selectedDecoration === "gem2") {
                    element.src = "img/Gems2.png";
                    element.alt = "Gem 2";
                } else if (gameState.selectedDecoration === "gem3") {
                    element.src = "img/Gems3.png";
                    element.alt = "Gem 3";
                } else if (gameState.selectedDecoration === "gem4") {
                    element.src = "img/Gems4.png";
                    element.alt = "Gem 4";
                }
            }

            // Position the element at the click location
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.transform = "translate(-50%, -50%)";

            // Add the element to the nail
            nail.appendChild(element);

            // Store the decoration in the game state
            gameState.nailDesigns[nailId] = gameState.nailDesigns[nailId] || {};
            gameState.nailDesigns[nailId].decoration =
                gameState.selectedDecoration;
        } else {
            // Handle other decorations (patterns, etc.)
            // Clear any existing background styles
            nail.style.background = "";
            nail.style.backgroundColor = "";

            if (gameState.selectedDecoration === "pattern-coffee-leopard") {
                // Create an image element for the leopard pattern
                const patternImg = document.createElement("img");
                patternImg.src = "img/Patterns1.png";
                patternImg.className = "pattern-img";
                patternImg.style.position = "absolute";
                patternImg.style.width = "100%";
                patternImg.style.height = "100%";
                patternImg.style.objectFit = "cover";
                patternImg.style.top = "0";
                patternImg.style.left = "0";

                // Remove any existing pattern images
                const existingPatterns = nail.querySelectorAll(".pattern-img");
                existingPatterns.forEach((p) => p.remove());

                // Add the new pattern image
                nail.appendChild(patternImg);
            } else {
                // Handle other patterns normally
                nail.classList.add(gameState.selectedDecoration);
            }
            gameState.nailDesigns[nailId] = gameState.nailDesigns[nailId] || {};
            gameState.nailDesigns[nailId].decoration =
                gameState.selectedDecoration;
        }
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

        // Remove all sticker and gem images
        const stickers = nail.querySelectorAll(".applied-sticker-img");
        stickers.forEach((sticker) => sticker.remove());
        const gems = nail.querySelectorAll(".applied-gem-img");
        gems.forEach((gem) => gem.remove());

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
        // For freestyle mode, show the cute popup
        showFreestyleModal();
    }
}

// Helper: Animate star burst from avatar
function showStarBurstOnAvatar() {
    console.log("Star burst triggered");
    const characterDisplay = document.getElementById("character-display");
    const avatarImg = characterDisplay.querySelector("img");
    if (!avatarImg) return;

    // Remove any existing burst first
    const oldBurst = characterDisplay.querySelector('.star-burst-container');
    if (oldBurst) oldBurst.remove();

    // Create a container for the stars
    let burst = document.createElement("div");
    burst.className = "star-burst-container";
    characterDisplay.appendChild(burst);

    // Generate 20 stars with random properties
    for (let i = 0; i < 20; i++) {
        const img = document.createElement("img");
        img.src = "img/star.png";
        img.className = "star-burst-star";
        // Random size between 16px and 40px
        const size = 16 + Math.random() * 24;
        img.style.width = img.style.height = size + "px";
        // Random angle (0 to 360 degrees)
        const angle = Math.random() * 360;
        // Random distance (60 to 100px)
        const dist = 60 + Math.random() * 40;
        // Random rotation (180 to 720 degrees)
        const rot = 180 + Math.random() * 540;
        // Animation delay for a more dynamic effect
        const delay = Math.random() * 0.2;
        // Calculate end position
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        img.style.setProperty('--star-x', `${x}px`);
        img.style.setProperty('--star-y', `${y}px`);
        img.style.setProperty('--star-rot', `${rot}deg`);
        img.style.animationDelay = `${delay}s`;
        burst.appendChild(img);
    }

    // Remove the burst after animation
    setTimeout(() => {
        burst.remove();
    }, 1500);
}

// Evaluate challenge results
function evaluateChallenge() {
    let score = 0;
    let totalPoints = 0;
    for (let i = 1; i <= 5; i++) {
        const userDesign = gameState.nailDesigns[i];
        const refDesign = gameState.challengeReference[i];
        if (!refDesign.decoration) {
            if (userDesign.color === refDesign.color) {
                score += 100;
            }
            totalPoints += 100;
        } else {
            if (userDesign.color === refDesign.color) {
                score += 50;
            }
            if (userDesign.decoration === refDesign.decoration) {
                score += 50;
            }
            totalPoints += 100;
        }
    }
    const percentage = Math.round((score / totalPoints) * 100);
    const characterDisplay = document.getElementById("character-display");
    const avatarImg = characterDisplay.querySelector("img");
    let isHappy = false;
    if (avatarImg) {
        if (gameState.selectedCharacter === "custom") {
            const { skinTone, hairStyle, eyeColor } = gameState.characterCustomization;
            const newExpression = percentage >= 50 ? '-happy' : '-mad';
            avatarImg.src = `img/avatar_${skinTone}-${hairStyle}-${eyeColor}${newExpression}.png`;
            isHappy = (newExpression === '-happy');
        }
    }
    // Show star burst only if happy
    if (percentage >= 50 && isHappy) {
        setTimeout(() => {
            showStarBurstOnAvatar();
        }, 120); // Small delay to ensure image is updated
    }
    resultTitle.textContent = "Challenge Complete!";
    resultMessage.textContent = `You scored ${percentage}% match.`;
    if (percentage >= 90) {
        resultMessage.textContent += " Perfect! You're a nail art master!";
        gameState.challengeLevel = Math.min(gameState.challengeLevel + 1, 5);
    } else if (percentage >= 80) {
        resultMessage.textContent += " Great job! Keep practicing!";
        gameState.challengeLevel = Math.min(gameState.challengeLevel + 1, 5);
    } else if (percentage >= 60) {
        resultMessage.textContent += " Good effort! Try again to improve your score.";
    } else {
        resultMessage.textContent += " Keep practicing! You can do better!";
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
                value: "#e83f29",
                display:
                    '<div class="color-preview" style="background-color: #e83f29;"></div>',
            },
            {
                id: "baseColor2",
                value: "#ed7235",
                display:
                    '<div class="color-preview" style="background-color: #ed7235;"></div>',
            },
            {
                id: "baseColor3",
                value: "#fff143",
                display:
                    '<div class="color-preview" style="background-color: #fff143;"></div>',
            },
            {
                id: "baseColor4",
                value: "#aed03b",
                display:
                    '<div class="color-preview" style="background-color: #aed03b;"></div>',
            },
            {
                id: "baseColor5",
                value: "#9ac4e9",
                display:
                    '<div class="color-preview" style="background-color: #9ac4e9;"></div>',
            },
            {
                id: "baseColor6",
                value: "#000000",
                display:
                    '<div class="color-preview" style="background-color: #000000;"></div>',
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
        id: "fancyColors",
        name: "Fancy Color",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><defs><linearGradient id="fancy1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a89877"/><stop offset="16%" stop-color="#c2b7a4"/><stop offset="32%" stop-color="#e7ded7"/><stop offset="48%" stop-color="#948a6c"/><stop offset="64%" stop-color="#e1d4c1"/><stop offset="80%" stop-color="#b2a289"/><stop offset="100%" stop-color="#b4a491"/></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#fancy1)"/></svg>',
        options: [
            {
                id: "fancyColor1",
                value: "fancyColor1",
                display:
                    '<div class="color-preview" style="background: linear-gradient(90deg, #a89877, #c2b7a4, #e7ded7, #948a6c, #e1d4c1, #b2a289, #b4a491);"></div>',
            },
            {
                id: "fancyColor2",
                value: "fancyColor2",
                display:
                    '<div class="color-preview" style="background: linear-gradient(90deg, #5f5f5f, #bcbcbc, #bcbcbc, #e9e9e9, #bcbcbc, #5f5f5f);"></div>',
            },
            {
                id: "fancyColor3",
                value: "fancyColor3",
                display:
                    '<div class="color-preview" style="background: linear-gradient(90deg, #0d1533, #18274c, #005397, #1670b9, #005397, #18274c, #0d1533);"></div>',
            },
            {
                id: "fancyColor4",
                value: "fancyColor4",
                display:
                    '<div class="color-preview" style="background: linear-gradient(90deg, #2f0925, #4e183e, #64255b, #4e183e, #2f0925);"></div>',
            },
            {
                id: "fancyColor5",
                value: "fancyColor5",
                display:
                    '<div class="color-preview" style="background: linear-gradient(90deg, #98a0c1, #97a4bf, #c5b2d1, #e5d1e5, #c5b2d1, #97a4bf, #98a0c1);"></div>',
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
                display:
                    '<img src="img/Patterns2.png" alt="Dots Pattern" class="deco-preview" />',
            },
            {
                id: "pattern3",
                value: "pattern-coffee-leopard",
                display:
                    '<img src="img/Patterns1.png" alt="Coffee Leopard Print" class="deco-preview" />',
            },
            {
                id: "pattern4",
                value: "pattern-flowers",
                display:
                    '<img src="img/Patterns3.png" alt="Flowers Pattern" class="deco-preview" />',
            },
            {
                id: "pattern5",
                value: "pattern-plaid",
                display:
                    '<img src="img/Patterns4.png" alt="Plaid Pattern" class="deco-preview" />',
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
                display:
                    '<img src="img/Sticker1.png" alt="Heart Sticker" class="deco-preview sticker-img" />',
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
                display:
                    '<img src="img/Sticker3.png" alt="Diamond Sticker" class="deco-preview sticker-img" />',
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
                value: "gem1",
                display:
                    '<img src="img/Gems1.png" alt="Gem 1" class="deco-preview gem-img" />',
            },
            {
                id: "gem2",
                value: "gem2",
                display:
                    '<img src="img/Gems2.png" alt="Gem 2" class="deco-preview gem-img" />',
            },
            {
                id: "gem3",
                value: "gem3",
                display:
                    '<img src="img/Gems3.png" alt="Gem 3" class="deco-preview gem-img" />',
            },
            {
                id: "gem4",
                value: "gem4",
                display:
                    '<img src="img/Gems4.png" alt="Gem 4" class="deco-preview gem-img" />',
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
    {
        level: 3,
        image: "/api/placeholder/300/200",
        timeLimit: 45,
        design: {
            1: { color: "#FFD700", decoration: "pattern-stripes" },
            2: { color: "#FF69B4", decoration: "sticker-star" },
            3: { color: "fancyColor1", decoration: null },
            4: { color: "#FF69B4", decoration: "sticker-star" },
            5: { color: "#FFD700", decoration: "pattern-stripes" },
        },
    },
    {
        level: 4,
        image: "/api/placeholder/300/200",
        timeLimit: 40,
        design: {
            1: { color: "#FF69B4", decoration: "pattern-flowers" },
            2: { color: "fancyColor3", decoration: "gem-round" },
            3: { color: "#FFD700", decoration: "sticker-butterfly" },
            4: { color: "fancyColor3", decoration: "gem-round" },
            5: { color: "#FF69B4", decoration: "pattern-flowers" },
        },
    },
    {
        level: 5,
        image: "/api/placeholder/300/200",
        timeLimit: 35,
        design: {
            1: { color: "fancyColor2", decoration: "pattern-plaid" },
            2: { color: "#FF69B4", decoration: "sticker-flower" },
            3: { color: "fancyColor5", decoration: "gem-heart" },
            4: { color: "#FF69B4", decoration: "sticker-flower" },
            5: { color: "fancyColor2", decoration: "pattern-plaid" },
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
const freestyleModal = document.getElementById("freestyle-modal");
const freestylePreview = document.getElementById("freestyle-preview");
const saveFreestyleBtn = document.getElementById("save-freestyle-btn");
const closeFreestyleBtn = document.getElementById("close-freestyle-btn");

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
    // Initialize both music tracks
    gameState.bgMusic = {
        light: new Audio("sound/bgm-light.mp3"),
        challenge: new Audio("sound/bgm-challenge.mp3"),
    };

    // Set properties for both tracks
    Object.values(gameState.bgMusic).forEach((music) => {
        music.loop = true;
        music.volume = 0.5; // Set volume to 50%
    });

    // Add event listeners for when audio can play
    Object.entries(gameState.bgMusic).forEach(([type, music]) => {
        music.addEventListener("canplaythrough", () => {
            console.log(`${type} background music loaded and ready to play`);
        });

        music.addEventListener("error", (e) => {
            console.error(`Error loading ${type} background music:`, e);
        });
    });
}

// Play background music
function playBackgroundMusic() {
    if (!gameState.bgMusic) return;

    // Stop all music first
    pauseBackgroundMusic();

    // Play the appropriate music based on game mode
    if (gameState.currentMode === "challenge") {
        gameState.bgMusic.challenge.play();
    } else {
        gameState.bgMusic.light.play();
    }
    gameState.isMusicPlaying = true;
}

// Pause background music
function pauseBackgroundMusic() {
    if (!gameState.bgMusic) return;

    // Pause all music tracks
    Object.values(gameState.bgMusic).forEach((music) => {
        music.pause();
    });
    gameState.isMusicPlaying = false;
}

// Show the freestyle modal with a preview
function showFreestyleModal() {
    // Clone the hand area for preview
    const hand = document.getElementById("hand");
    const handClone = hand.cloneNode(true);
    handClone.style.transform = "scale(0.7)";
    handClone.style.margin = "0 auto";
    handClone.style.pointerEvents = "none";
    freestylePreview.innerHTML = "";
    freestylePreview.appendChild(handClone);

    document.getElementById("modal-blur-overlay").style.display = "block";
    freestyleModal.style.display = "block";
}

// Close modal
closeFreestyleBtn.onclick = () => {
    freestyleModal.style.display = "none";
    document.getElementById("modal-blur-overlay").style.display = "none";
};

// Save as image
saveFreestyleBtn.onclick = () => {
    // Use html2canvas to capture the preview
    html2canvas(freestylePreview).then((canvas) => {
        const link = document.createElement("a");
        link.download = "my-nail-design.png";
        link.href = canvas.toDataURL();
        link.click();
    });
};
