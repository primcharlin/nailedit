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
    activeToolCategory: null, // Keep track of the active tool category
};

// Tool categories and options
const toolCategories = [
    {
        id: "baseColors",
        name: "Base Colors",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#ff6b9a"/></svg>',
        options: [
            { id: "baseColor1", value: "#FF0000", display: '<div class="color-preview" style="background-color: #FF0000;"></div>' },
            { id: "baseColor2", value: "#FFA500", display: '<div class="color-preview" style="background-color: #FFA500;"></div>' },
            { id: "baseColor3", value: "#FFFF00", display: '<div class="color-preview" style="background-color: #FFFF00;"></div>' },
            { id: "baseColor4", value: "#00FF00", display: '<div class="color-preview" style="background-color: #00FF00;"></div>' },
            { id: "baseColor5", value: "#0000FF", display: '<div class="color-preview" style="background-color: #0000FF;"></div>' }
        ]
    },
    {
        id: "pastelColors",
        name: "Pastel Colors",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#FFC0CB"/></svg>',
        options: [
            { id: "pastelColor1", value: "#FFB6C1", display: '<div class="color-preview" style="background-color: #FFB6C1;"></div>' },
            { id: "pastelColor2", value: "#FFD700", display: '<div class="color-preview" style="background-color: #FFD700;"></div>' },
            { id: "pastelColor3", value: "#98FB98", display: '<div class="color-preview" style="background-color: #98FB98;"></div>' },
            { id: "pastelColor4", value: "#ADD8E6", display: '<div class="color-preview" style="background-color: #ADD8E6;"></div>' },
            { id: "pastelColor5", value: "#DDA0DD", display: '<div class="color-preview" style="background-color: #DDA0DD;"></div>' }
        ]
    },
    {
        id: "glitterColors",
        name: "Glitter",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3L13.5 8.5H19L14.5 12L16 17.5L12 14L8 17.5L9.5 12L5 8.5H10.5L12 3Z" fill="#FFD700"/></svg>',
        options: [
            { id: "glitter1", value: "glitter-gold", display: '<div class="deco-preview glitter-gold"></div>' },
            { id: "glitter2", value: "glitter-silver", display: '<div class="deco-preview glitter-silver"></div>' },
            { id: "glitter3", value: "glitter-rainbow", display: '<div class="deco-preview glitter-rainbow"></div>' },
            { id: "glitter4", value: "glitter-blue", display: '<div class="deco-preview glitter-blue"></div>' },
            { id: "glitter5", value: "glitter-pink", display: '<div class="deco-preview glitter-pink"></div>' }
        ]
    },
    {
        id: "patterns",
        name: "Patterns",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="6" width="18" height="3" fill="#ff6b9a"/><rect x="3" y="12" width="18" height="3" fill="#ff6b9a"/><rect x="3" y="18" width="18" height="3" fill="#ff6b9a"/></svg>',
        options: [
            { id: "pattern1", value: "pattern-stripes", display: '<div class="deco-preview pattern-stripes"></div>' },
            { id: "pattern2", value: "pattern-dots", display: '<div class="deco-preview pattern-dots"></div>' },
            { id: "pattern3", value: "pattern-zigzag", display: '<div class="deco-preview pattern-zigzag"></div>' },
            { id: "pattern4", value: "pattern-leopard", display: '<div class="deco-preview pattern-leopard"></div>' },
            { id: "pattern5", value: "pattern-marble", display: '<div class="deco-preview pattern-marble"></div>' }
        ]
    },
    {
        id: "stickers",
        name: "Stickers",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff6b9a"/></svg>',
        options: [
            { id: "sticker1", value: "sticker-heart", display: '<div class="deco-preview sticker-heart"></div>' },
            { id: "sticker2", value: "sticker-star", display: '<div class="deco-preview sticker-star"></div>' },
            { id: "sticker3", value: "sticker-flower", display: '<div class="deco-preview sticker-flower"></div>' },
            { id: "sticker4", value: "sticker-butterfly", display: '<div class="deco-preview sticker-butterfly"></div>' },
            { id: "sticker5", value: "sticker-diamond", display: '<div class="deco-preview sticker-diamond"></div>' }
        ]
    },
    {
        id: "gems",
        name: "Gems",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L4 10l8 12 8-12-8-8z" fill="#00FFFF"/></svg>',
        options: [
            { id: "gem1", value: "gem-round", display: '<div class="deco-preview gem-round"></div>' },
            { id: "gem2", value: "gem-square", display: '<div class="deco-preview gem-square"></div>' },
            { id: "gem3", value: "gem-teardrop", display: '<div class="deco-preview gem-teardrop"></div>' },
            { id: "gem4", value: "gem-heart", display: '<div class="deco-preview gem-heart"></div>' },
            { id: "gem5", value: "gem-star", display: '<div class="deco-preview gem-star"></div>' }
        ]
    }
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
const gameArea = document.getElementById("game-area");
const freestyleButton = document.getElementById("freestyle-button");
const challengeButton = document.getElementById("challenge-button");
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
    toolCategories.forEach(category => {
        const categoryButton = document.createElement("div");
        categoryButton.className = "category-button";
        categoryButton.dataset.categoryId = category.id;
        categoryButton.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
        `;
        
        // Add click event to show options for this category
        categoryButton.addEventListener("click", () => {
            toggleCategoryOptions(category.id);
        });
        
        categoryBar.appendChild(categoryButton);
    });
    
    // Append elements to tools panel
    horizontalToolsPanel.appendChild(categoryBar);
    horizontalToolsPanel.appendChild(optionsContainer);
    
    // Replace existing tools panel with the new one
    existingToolsPanel.parentNode.replaceChild(horizontalToolsPanel, existingToolsPanel);
}

// Toggle options for a category
function toggleCategoryOptions(categoryId) {
    const optionsContainer = document.getElementById("options-container");
    const allCategoryButtons = document.querySelectorAll(".category-button");
    
    // If clicking the same category, toggle its visibility
    if (gameState.activeToolCategory === categoryId) {
        // Hide options
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'none';