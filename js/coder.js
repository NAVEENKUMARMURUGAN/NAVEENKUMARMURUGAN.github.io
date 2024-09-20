const body = document.body;
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Check if user preference is set, if not check value of body class for light or dark else it means that colorscheme = auto
if (localStorage.getItem("colorscheme")) {
    setTheme(localStorage.getItem("colorscheme"));
} else if (body.classList.contains('colorscheme-light') || body.classList.contains('colorscheme-dark')) {
    setTheme(body.classList.contains("colorscheme-dark") ? "dark" : "light");
} else {
    setTheme(darkModeMediaQuery.matches ? "dark" : "light");
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        let theme = body.classList.contains("colorscheme-dark") ? "light" : "dark";
        setTheme(theme);
        rememberTheme(theme);
    });
}

darkModeMediaQuery.addListener((event) => {
    setTheme(event.matches ? "dark" : "light");
});

document.addEventListener("DOMContentLoaded", function () {
    let node = document.querySelector('.preload-transitions');
    node.classList.remove('preload-transitions');
});

function setTheme(theme) {
    body.classList.remove('colorscheme-auto');
    let inverse = theme === 'dark' ? 'light' : 'dark';
    body.classList.remove('colorscheme-' + inverse);
    body.classList.add('colorscheme-' + theme);
    document.documentElement.style['color-scheme'] = theme;

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
    
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    if (theme === 'dark') {
        const message = {
            type: 'set-theme',
            theme: 'github-dark'
        };
        waitForElm('.utterances-frame').then((iframe) => {
            iframe.contentWindow.postMessage(message, 'https://utteranc.es');
        })
        
    }
    else {
        const message = {
            type: 'set-theme',
            theme: 'github-light'
        };
        waitForElm('.utterances-frame').then((iframe) => {
            iframe.contentWindow.postMessage(message, 'https://utteranc.es');
        })
        
    }

    function sendMessage(message) {
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe) return;
        iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app');
      }
      sendMessage({
        setConfig: {
          theme: theme,
        },
      });
    
    // Create and send event
    const event = new Event('themeChanged');
    document.dispatchEvent(event);
}

function rememberTheme(theme) {
    localStorage.setItem('colorscheme', theme);
}

async function askQuestion(question) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer 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`,  // Replace with your actual API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",  // Ensure the model name is correct
            prompt: question,
            max_tokens: 50,  // Set a reasonable max_tokens value
            temperature: 0.7  // Optional: Adjust temperature for creativity
        })
    });

    if (response.ok) {
        const data = await response.json();
        
        // Add a check to ensure 'choices' is defined and has at least one element
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].text.trim();
        } else {
            console.error('Unexpected API response structure:', data);
            return 'Sorry, I could not process your request.';
        }
    } else {
        console.error('API error:', response.status, response.statusText);
        return 'Sorry, something went wrong.';
    }
}

document.getElementById('submitBtn').addEventListener('click', async () => {
    const question = document.getElementById('questionInput').value;
    if (question) {
        document.getElementById('chatWindow').innerHTML += `<p><strong>You:</strong> ${question}</p>`;
        const answer = await askQuestion(question);
        document.getElementById('chatWindow').innerHTML += `<p><strong>Naveen:</strong> ${answer}</p>`;
        document.getElementById('questionInput').value = '';  // Clear input field
    }
});