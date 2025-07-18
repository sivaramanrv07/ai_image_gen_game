const promptForm = document.querySelector(".prompt-form");
const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const generateBtn = document.querySelector(".generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");

const API_KEY = "vk-mFOBg3cgo90fNuXdnXZB19nwOk5nDSDjCyUau2IRe4IOiQ";

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

"Create a portrait of someone with a hearing aid surrounded by musical notes and light.",
];

(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);
  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
  return { width: calculatedWidth, height: calculatedHeight };
};

const createPuzzle = (container, imageUrl, rows = 3, cols = 3) => {
  container.innerHTML = "";
  container.classList.add("puzzle-container");
  container.style.position = "relative";
  container.style.display = "grid";
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gap = "2px";
  container.style.aspectRatio = "1/1";
  container.style.overflow = "hidden";

  const pieces = [];

  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const piece = document.createElement("div");
        piece.classList.add("puzzle-piece");
        piece.style.backgroundImage = `url(${imageUrl})`;
        piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
        piece.style.backgroundPosition = `${(c * 100) / (cols - 1)}% ${(r * 100) / (rows - 1)}%`;
        piece.style.width = "100%";
        piece.style.height = "100%";
        piece.style.cursor = "grab";
        piece.dataset.correctIndex = r * cols + c;
        piece.draggable = true;
        pieces.push(piece);
      }
    }

    const shuffled = [...pieces].sort(() => Math.random() - 0.5);
    shuffled.forEach(piece => container.appendChild(piece));
    addSwapListeners(container, rows, cols);
  };
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

// ✅ Confetti (needs canvas-confetti library in HTML)
const launchConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    scalar: 1.2
  });
};

// ✅ Animated success message
const showSuccessMessage = (message) => {
  let msgBox = document.getElementById("puzzle-success");
  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "puzzle-success";
    msgBox.style.position = "fixed";
    msgBox.style.top = "20px";
    msgBox.style.left = "50%";
    msgBox.style.transform = "translateX(-50%)";
    msgBox.style.padding = "12px 24px";
    msgBox.style.backgroundColor = "#4caf50";
    msgBox.style.color = "#fff";
    msgBox.style.borderRadius = "10px";
    msgBox.style.fontWeight = "bold";
    msgBox.style.zIndex = 9999;
    msgBox.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    msgBox.style.fontSize = "18px";
    msgBox.style.animation = "popIn 0.5s ease-out";
    document.body.appendChild(msgBox);
  }

  msgBox.textContent = message;
  msgBox.style.opacity = "1";
  msgBox.style.display = "block";

  setTimeout(() => {
    msgBox.style.opacity = "0";
    setTimeout(() => (msgBox.style.display = "none"), 600);
  }, 3000);
};

// ✅ Puzzle completion animation
const checkPuzzleSolved = (container) => {
  const children = Array.from(container.children);
  const isSolved = children.every((piece, i) => parseInt(piece.dataset.correctIndex) === i);

  if (isSolved) {
    showSuccessMessage("🎉 Puzzle Solved!");
    launchConfetti();

    // Animate all pieces for fun
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
      }, 1000);
    }, 3000);
  }
};


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

  const puzzleContainer = document.getElementById("puzzle-container");
  const puzzleBox = document.createElement("div");
  puzzleBox.style.width = "300px";
  puzzleBox.style.aspectRatio = "1 / 1";
  puzzleBox.style.margin = "10px";
  puzzleContainer.appendChild(puzzleBox);
  createPuzzle(puzzleBox, imageUrl, 3, 3);
};

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const API_URL = "https://api.vyro.ai/v2/image/generations";
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const formData = new FormData();
      formData.append("prompt", promptText);
      formData.append("style", "realistic");
      formData.append("aspect_ratio", aspectRatio);

      // ✅ Use random seed to generate unique images
      const seed = Math.floor(Math.random() * 1000000);
      formData.append("seed", seed.toString());

      formData.append("width", width);
      formData.append("height", height);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
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
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent = "Generation failed!";
    }
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  galleryGrid.innerHTML = "";
  document.getElementById("puzzle-container").innerHTML = "";

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

const handleFormSubmit = (e) => {
  e.preventDefault();
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();
  if (!promptText) {
    alert("Please enter a prompt");
    return;
  }
  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

promptBtn.addEventListener("click", () => {
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
});

themeToggle.addEventListener("click", toggleTheme);
promptForm.addEventListener("submit", handleFormSubmit);

const voiceBtn = document.getElementById("voice-btn");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

voiceBtn.addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log("Voice input:", transcript);
  inputBox.value = transcript;

  // Trigger image generation
  generateBtn.click();
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
};
