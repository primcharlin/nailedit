// Wait for the DOM to be fully loaded before executing code
document.addEventListener("DOMContentLoaded", function () {
    // Game state
    const gameState = {
        isStarted: false,
        selectedShape: null,
        selectedTool: null,
    };

    // DOM Elements
    const startButton = document.getElementById("start-button");
    const gameTitleBox = document.getElementById("game-title-box");
    const shapeButtons = document.querySelectorAll(".shape-button");
    const toolButtons = document.querySelectorAll(".tool-button");

    // Initialize the game
    function initGame() {
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Start button listener
        startButton.addEventListener("click", startGame);

        // Shape button listeners
        shapeButtons.forEach((button) => {
            button.addEventListener("click", function () {
                selectShape(this.id.replace("-shape", ""));
            });
        });

        // Tool button listeners
        toolButtons.forEach((button) => {
            button.addEventListener("click", function () {
                selectTool(this.id.replace("-tool", ""));
            });
        });
    }

    // Start the game
    function startGame() {
        gameState.isStarted = true;

        // Hide the title and start button
        gameTitleBox.style.display = "none";
        startButton.style.display = "none";

        // Here you would show the game elements
        console.log("Game started!");

        // Additional game initialization code would go here
        // For example, showing a hand with nails to be styled
    }

    // Select a nail shape
    function selectShape(shape) {
        // Only allow shape selection if game has started
        if (!gameState.isStarted) {
            console.log("Please start the game first!");
            return;
        }

        // Update selected shape
        gameState.selectedShape = shape;

        // Update UI to show selected shape
        shapeButtons.forEach((button) => {
            if (button.id === shape + "-shape") {
                button.style.backgroundColor = "#f0c0c0"; // Highlight selected
            } else {
                button.style.backgroundColor = "rgba(220, 220, 220, 0.8)"; // Reset others
            }
        });

        console.log("Selected nail shape:", shape);
    }

    // Select a tool
    function selectTool(tool) {
        // Update selected tool
        gameState.selectedTool = tool;

        // Update UI to show selected tool
        toolButtons.forEach((button) => {
            if (button.id === tool + "-tool") {
                button.style.transform = "scale(1.1)"; // Highlight selected
            } else {
                button.style.transform = "scale(1)"; // Reset others
            }
        });

        console.log("Selected tool:", tool);

        // Tool-specific actions would go here
        // For example, changing cursor to show selected polish or tool
    }

    // Initialize the game when the page loads
    initGame();
});
