// DOM Elements
const promptForm = document.querySelector(".prompt-form");
const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const generateBtn = document.querySelector(".generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridSizeSelect = document.getElementById("grid-size-select");
const voiceBtn = document.getElementById("voice-btn");

// Configuration
const API_KEY = "vk-mFOBg3cgo90fNuXdnXZB19nwOk5nDSDjCyUau2IRe4IOiQ";
const API_URL = "https://api.vyro.ai/v2/image/generations";

const examplePrompts = [
  "Show a superhero in a wheelchair flying through a futuristic city.",
  "Create an image of a blind musician performing in a glowing concert hall with sound waves around them.",
  "Generate a fantasy warrior with a prosthetic arm made of enchanted metal.",
  "Visualize a peaceful park with accessible paths, sensory gardens, and inclusive playgrounds.",
  "Design a magical school where ramps float and books read themselves aloud.",
  "Imagine a space station with zero-gravity mobility aids and voice-controlled doors.",
  "Create a cozy home with adaptive furniture and glowing sign-language walls.",
  "Show a beach with wheelchair-friendly boardwalks and tactile sand that changes color when touched.",
  "Make an image of a person painting with their feet in a sunny studio.",
  "Show a dancer with a prosthetic leg performing on a glowing stage.",
  "Visualize a person using a communication device to talk with magical creatures.",
  "Create a portrait of someone with a hearing aid surrounded by musical notes and light."
];

// Theme Management
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// Utility Functions
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);
  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);
  
  // Ensure dimensions are multiples of 16
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
  
  return { width: calculatedWidth, height: calculatedHeight };
};

// Validation Functions
const showError = (id, message) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
};

const clearErrors = () => {
  document.querySelectorAll(".error-message").forEach(element => {
    element.textContent = "";
    element.style.display = "none";
  });
};

const attachLiveValidation = (element, errorId) => {
  if (element) {
    element.addEventListener("input", () => {
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
      }
    });
  }
};

const validateForm = () => {
  clearErrors();
  let hasError = false;

  if (!promptInput.value.trim()) {
    showError("error-prompt", "Prompt is required.");
    hasError = true;
  }

  if (!modelSelect.value) {
    showError("error-model", "Select a model.");
    hasError = true;
  }

  if (!countSelect.value) {
    showError("error-count", "Select image count.");
    hasError = true;
  }

  if (!ratioSelect.value) {
    showError("error-ratio", "Select aspect ratio.");
    hasError = true;
  }

  if (!gridSizeSelect.value) {
    showError("error-grid", "Select puzzle grid.");
    hasError = true;
  }

  return !hasError;
};

// Show/Hide Images Feature
const createImageToggleControl = () => {
  // Remove existing control if it exists
  const existingControl = document.getElementById("image-toggle-control");
  if (existingControl) {
    existingControl.remove();
  }

  const controlDiv = document.createElement("div");
  controlDiv.id = "image-toggle-control";
  controlDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
    user-select: none;
  `;
  
  controlDiv.innerHTML = `
    <i class="fa-solid fa-eye"></i>
    <span style="margin-left: 8px;">Hide Images</span>
  `;
  
  let imagesVisible = true;
  
  controlDiv.addEventListener("click", () => {
    imagesVisible = !imagesVisible;
    const galleryGrid = document.querySelector(".gallery-grid");
    
    if (galleryGrid) {
      galleryGrid.style.display = imagesVisible ? "grid" : "none";
    }
    
    // Update button appearance
    if (imagesVisible) {
      controlDiv.style.background = "#4CAF50";
      controlDiv.innerHTML = `
        <i class="fa-solid fa-eye"></i>
        <span style="margin-left: 8px;">Hide Images</span>
      `;
    } else {
      controlDiv.style.background = "#FF5722";
      controlDiv.innerHTML = `
        <i class="fa-solid fa-eye-slash"></i>
        <span style="margin-left: 8px;">Show Images</span>
      `;
    }
  });
  
  controlDiv.addEventListener("mouseenter", () => {
    controlDiv.style.transform = "scale(1.05)";
  });
  
  controlDiv.addEventListener("mouseleave", () => {
    controlDiv.style.transform = "scale(1)";
  });
  
  document.body.appendChild(controlDiv);
};

const removeImageToggleControl = () => {
  const controlDiv = document.getElementById("image-toggle-control");
  if (controlDiv) {
    controlDiv.style.transition = "all 0.5s ease";
    controlDiv.style.opacity = "0";
    controlDiv.style.transform = "scale(0.8)";
    setTimeout(() => {
      controlDiv.remove();
    }, 500);
  }
};

// Puzzle Functions
const launchConfetti = () => {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      scalar: 1.2
    });
  }
};

const showSuccessMessage = (message) => {
  let msgBox = document.getElementById("puzzle-success");
  
  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "puzzle-success";
    Object.assign(msgBox.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 24px",
      backgroundColor: "#4caf50",
      color: "#fff",
      borderRadius: "10px",
      fontWeight: "bold",
      zIndex: "9999",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      fontSize: "18px",
      animation: "popIn 0.5s ease-out"
    });
    document.body.appendChild(msgBox);
  }

  msgBox.textContent = message;
  msgBox.style.opacity = "1";
  msgBox.style.display = "block";

  setTimeout(() => {
    msgBox.style.opacity = "0";
    setTimeout(() => msgBox.style.display = "none", 600);
  }, 3000);
};

const checkPuzzleSolved = (container) => {
  const children = Array.from(container.children);
  const isSolved = children.every((piece, i) => parseInt(piece.dataset.correctIndex) === i);

  if (isSolved) {
    showSuccessMessage("🎉 Puzzle Solved!");
    launchConfetti();

    // Remove the image toggle control when puzzle is solved
    removeImageToggleControl();

    // Animate completion
    container.querySelectorAll(".puzzle-piece").forEach(piece => {
      piece.style.transition = "transform 0.6s ease, opacity 0.6s ease";
      piece.style.transform = "scale(1.1) rotate(5deg)";
    });

    setTimeout(() => {
      container.style.transition = "transform 1s ease, opacity 1s ease";
      container.style.transform = "scale(0.9)";
      container.style.opacity = "0";
      setTimeout(() => {
        container.remove();
        // Auto refresh page after 1 minute (60 seconds)
        setTimeout(() => {
          window.location.reload();
        }, 60000); // 60,000 milliseconds = 1 minute
      }, 1000);
    }, 3000);
  }
};

const addSwapListeners = (container, rows, cols) => {
  let dragged = null;

  Array.from(container.children).forEach((piece) => {
    piece.addEventListener("dragstart", () => {
      dragged = piece;
      piece.style.opacity = "0.5";
    });

    piece.addEventListener("dragend", () => {
      dragged = null;
      piece.style.opacity = "1";
    });

    piece.addEventListener("dragover", (e) => e.preventDefault());

    piece.addEventListener("drop", () => {
      if (dragged && dragged !== piece) {
        const draggedClone = dragged.cloneNode(true);
        const targetClone = piece.cloneNode(true);

        container.replaceChild(targetClone, dragged);
        container.replaceChild(draggedClone, piece);

        addSwapListeners(container, rows, cols);
        checkPuzzleSolved(container);
      }
    });
  });
};

const createPuzzle = (container, imageUrl, rows = 3, cols = 3) => {
  container.innerHTML = "";
  container.classList.add("puzzle-container");
  
  Object.assign(container.style, {
    position: "relative",
    display: "grid",
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "2px",
    aspectRatio: "1/1",
    overflow: "hidden"
  });

  const pieces = [];
  const img = new Image();
  
  img.onload = () => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const piece = document.createElement("div");
        piece.classList.add("puzzle-piece");
        
        Object.assign(piece.style, {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${(c * 100) / (cols - 1)}% ${(r * 100) / (rows - 1)}%`,
          width: "100%",
          height: "100%",
          cursor: "grab",
          border: "1px solid #ccc"
        });
        
        piece.dataset.correctIndex = r * cols + c;
        piece.draggable = true;
        pieces.push(piece);
      }
    }

    // Shuffle and add pieces
    const shuffled = [...pieces].sort(() => Math.random() - 0.5);
    shuffled.forEach(piece => container.appendChild(piece));
    addSwapListeners(container, rows, cols);
  };
  
  img.src = imageUrl;
};

// Image Generation Functions
const updateImageCard = (index, imageUrl) => {
  const imgCard = document.getElementById(`img-card-${index}`);
  if (!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `
    <img src="${imageUrl}" alt="Generated image" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2)" />
    <div class="img-overlay">
      <a href="${imageUrl}" class="img-download-btn" title="Download Image" download>
        <i class="fa-solid fa-download"></i>
      </a>
    </div>
  `;

  // Create puzzle
  const puzzleContainer = document.getElementById("puzzle-container");
  if (puzzleContainer) {
    const puzzleBox = document.createElement("div");
    Object.assign(puzzleBox.style, {
      width: "300px",
      aspectRatio: "1 / 1",
      margin: "10px"
    });
    
    puzzleContainer.appendChild(puzzleBox);
    const gridSize = parseInt(gridSizeSelect.value) || 3;
    createPuzzle(puzzleBox, imageUrl, gridSize, gridSize);
  }
};

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const formData = new FormData();
      formData.append("prompt", promptText);
      formData.append("style", "realistic");
      formData.append("aspect_ratio", aspectRatio);
      formData.append("seed", Math.floor(Math.random() * 1000000).toString());
      formData.append("width", width);
      formData.append("height", height);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Image generation failed");
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.startsWith("image")) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        updateImageCard(i, imageUrl);
      } else {
        const data = await response.json();
        if (!data.image_url) throw new Error("No image URL returned");
        updateImageCard(i, data.image_url);
      }
    } catch (error) {
      console.error(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      if (imgCard) {
        imgCard.classList.replace("loading", "error");
        const statusText = imgCard.querySelector(".status-text");
        if (statusText) statusText.textContent = "Generation failed!";
      }
    }
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  galleryGrid.innerHTML = "";
  const puzzleContainer = document.getElementById("puzzle-container");
  if (puzzleContainer) puzzleContainer.innerHTML = "";

  // Create the image toggle control when images are generated
  createImageToggleControl();

  for (let i = 0; i < imageCount; i++) {
    galleryGrid.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p class="status-text">Generating...</p>
        </div>
      </div>`;
  }

  document.querySelectorAll(".img-card").forEach((card, i) => {
    setTimeout(() => card.classList.add("animate-in"), 100 * i);
  });

  generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Event Handlers
const handleFormSubmit = (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

const handlePromptButtonClick = () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  let i = 0;
  
  promptInput.focus();
  promptInput.value = "";
  promptBtn.disabled = true;
  promptBtn.style.opacity = "0.5";
  
  const typeInterval = setInterval(() => {
    if (i < prompt.length) {
      promptInput.value += prompt.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
      promptBtn.disabled = false;
      promptBtn.style.opacity = "0.8";
    }
  }, 10);
};

// Voice Recognition Functions
const setupVoiceRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported');
    return;
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Store original placeholder
  let originalPlaceholder = promptInput.placeholder || "Enter your prompt...";

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      // Show listening in text input
      promptInput.value = "";
      promptInput.placeholder = "🎤 Listening...";
      promptInput.style.fontStyle = "italic";
      promptInput.style.color = "#2196F3";
      recognition.start();
    });
  }

  recognition.onstart = () => {
    console.log("Voice recognition started");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Voice input:", transcript);
    
    // Restore normal input appearance and fill with transcript
    promptInput.placeholder = originalPlaceholder;
    promptInput.style.fontStyle = "normal";
    promptInput.style.color = "";
    promptInput.value = transcript;
    
    // Focus on the input field after voice input is complete
    promptInput.focus();
  };

  recognition.onend = () => {
    // Restore normal input appearance if recognition ended without result
    promptInput.placeholder = originalPlaceholder;
    promptInput.style.fontStyle = "normal";
    promptInput.style.color = "";
    console.log("Voice recognition ended");
  };

  recognition.onerror = (event) => {
    // Restore normal input appearance on error
    promptInput.placeholder = originalPlaceholder;
    promptInput.style.fontStyle = "normal";
    promptInput.style.color = "";
    console.error("Speech recognition error:", event.error);
    
    // Show error message briefly in input
    promptInput.placeholder = `❌ Voice error: ${event.error}`;
    setTimeout(() => {
      promptInput.placeholder = originalPlaceholder;
    }, 3000);
  };
};

// Initialize Application
const initializeApp = () => {
  initializeTheme();
  setupVoiceRecognition();

  // Attach live validation
  attachLiveValidation(promptInput, "error-prompt");
  attachLiveValidation(modelSelect, "error-model");
  attachLiveValidation(countSelect, "error-count");
  attachLiveValidation(ratioSelect, "error-ratio");
  attachLiveValidation(gridSizeSelect, "error-grid");

  // Event listeners
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (promptForm) promptForm.addEventListener("submit", handleFormSubmit);
  if (promptBtn) promptBtn.addEventListener("click", handlePromptButtonClick);
};

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);