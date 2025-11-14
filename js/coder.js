const body = document.body;
const darkModeToggle = document.getElementById("dark-mode-toggle");
const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Check if user preference is set, if not check value of body class for light or dark else it means that colorscheme = auto
if (localStorage.getItem("colorscheme")) {
  setTheme(localStorage.getItem("colorscheme"));
} else if (
  body.classList.contains("colorscheme-light") ||
  body.classList.contains("colorscheme-dark")
) {
  setTheme(body.classList.contains("colorscheme-dark") ? "dark" : "light");
} else {
  setTheme(darkModeMediaQuery.matches ? "dark" : "light");
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    let theme = body.classList.contains("colorscheme-dark") ? "light" : "dark";
    setTheme(theme);
    rememberTheme(theme);
  });
}

darkModeMediaQuery.addListener((event) => {
  setTheme(event.matches ? "dark" : "light");
});

document.addEventListener("DOMContentLoaded", function () {
  let node = document.querySelector(".preload-transitions");
  node.classList.remove("preload-transitions");
});

function setTheme(theme) {
  body.classList.remove("colorscheme-auto");
  let inverse = theme === "dark" ? "light" : "dark";
  body.classList.remove("colorscheme-" + inverse);
  body.classList.add("colorscheme-" + theme);
  document.documentElement.style["color-scheme"] = theme;

  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  if (theme === "dark") {
    const message = {
      type: "set-theme",
      theme: "github-dark",
    };
    waitForElm(".utterances-frame").then((iframe) => {
      iframe.contentWindow.postMessage(message, "https://utteranc.es");
    });
  } else {
    const message = {
      type: "set-theme",
      theme: "github-light",
    };
    waitForElm(".utterances-frame").then((iframe) => {
      iframe.contentWindow.postMessage(message, "https://utteranc.es");
    });
  }

  function sendMessage(message) {
    const iframe = document.querySelector("iframe.giscus-frame");
    if (!iframe) return;
    iframe.contentWindow.postMessage({ giscus: message }, "https://giscus.app");
  }
  sendMessage({
    setConfig: {
      theme: theme,
    },
  });

  // Create and send event
  const event = new Event("themeChanged");
  document.dispatchEvent(event);
}

function rememberTheme(theme) {
  localStorage.setItem("colorscheme", theme);
}

async function askQuestion(question) {
  try {
    const response = await fetch(
      "https://payload.vextapp.com/hook/AK1T00ZYHN/catch/nkthemaster",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Apikey: "Api-Key NNJ4yqny.SLznirOPgDl9CO8YBl5fFYUth6S5ZMmk",
        },
        body: JSON.stringify({ payload: question }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text?.trim() || "Sorry, I could not process your request.";
  } catch (error) {
    console.error("Error:", error);
    return "Sorry, something went wrong. Please try again later.";
  }
}

// Add loading animation
function addLoadingAnimation() {
  const loadingHTML = `
        <p class="loading-message">
            <strong>Naveen's Assistant:</strong>
            <span class="loading-dots">
                <span>.</span><span>.</span><span>.</span>
            </span>
        </p>`;
  document
    .getElementById("chatWindow")
    .insertAdjacentHTML("beforeend", loadingHTML);
}

// Remove loading animation
function removeLoadingAnimation() {
  const loadingMessage = document.querySelector(".loading-message");
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

// Scroll to bottom of chat
function scrollToBottom() {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Format message with markdown (you can expand this)
function formatMessage(message) {
  return message
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

// Add message to chat
function addMessage(role, content) {
  const chatWindow = document.getElementById("chatWindow");
  const formattedContent = formatMessage(content);
  const name = role === "user" ? "You" : "Naveen's Assistant";

  const messageHTML = `
    <p class="message ${role}-message" style="opacity: 0;">
      <strong>${name}:</strong> 
      <span class="message-content">${formattedContent}</span>
    </p>`;

  // Insert before the last message to maintain scroll position
  chatWindow.insertAdjacentHTML("beforeend", messageHTML);

  // Trigger fade-in animation
  setTimeout(() => {
    const newMessage = chatWindow.lastElementChild;
    newMessage.style.opacity = "1";
    scrollToBottom();
  }, 10);
}

// Handle form submission
async function handleSubmit(event) {
  event?.preventDefault();

  const questionInput = document.getElementById("questionInput");
  const submitBtn = document.getElementById("submitBtn");
  const question = questionInput.value.trim();

  if (!question) return;

  // Disable input and button while processing
  questionInput.disabled = true;
  submitBtn.disabled = true;

  // Add user message
  addMessage("user", question);

  // Clear input
  questionInput.value = "";

  // Show loading animation
  addLoadingAnimation();

  try {
    const answer = await askQuestion(question);
    removeLoadingAnimation();
    addMessage("assistant", answer);
  } catch (error) {
    removeLoadingAnimation();
    addMessage("assistant", "Sorry, something went wrong. Please try again.");
  } finally {
    // Re-enable input and button
    questionInput.disabled = false;
    submitBtn.disabled = false;
    questionInput.focus();
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitBtn");
  const questionInput = document.getElementById("questionInput");

  submitBtn.addEventListener("click", handleSubmit);

  questionInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  });

  // Welcome message
  setTimeout(() => {
    addMessage("assistant", "Hi! Ask me about my work, projects, skills, or experience.");
  }, 500);

  // Add chat header with robot icon
  const chatWindow = document.getElementById("chatWindow");
  const headerHTML = `
    <div class="chat-header">
      <div class="robot-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"/>
          <circle cx="12" cy="5" r="2"/>
          <path d="M12 7v4"/>
          <line x1="8" y1="16" x2="8" y2="16"/>
          <line x1="16" y1="16" x2="16" y2="16"/>
        </svg>
      </div>
      <h3>Naveen's Assistant <span class="chip">AI</span></h3>
    </div>`;

  chatWindow.insertAdjacentHTML("afterbegin", headerHTML);
});
