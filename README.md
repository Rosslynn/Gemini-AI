# 🤖 Gemini Code Sidecar

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Privacy](https://img.shields.io/badge/Privacy-Local_Storage-green)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

**Gemini Code Sidecar** is an advanced AI browser extension designed for developers who need a persistent, context-aware coding assistant without being tied to a specific IDE. It acts as a side panel that can "see", read, and refactor code from any webpage (GitHub, GitLab, Online IDEs, Legacy CMS).

## ✨ Key Features

*   **🧠 Advanced AI**: Powered by Google Gemini 2.5 Flash (Speed) and 3.0 Pro (Reasoning).
*   **👀 Visual Context**: Capable of taking screenshots and analyzing UI elements.
*   **🔌 Universal Integration**: Reads code from DOM elements in GitHub, GitLab, Monaco Editor, Ace Editor, and more.
*   **⚡ Quick Actions**: Refactor, Explain, Fix Bugs, and Generate Tests with a single click.
*   **🗣️ Voice-to-Code**: Integrated voice dictation for hands-free prompting.
*   **🔒 Privacy First**: "Bring Your Own Key" architecture. Your API key and code snippets are stored locally.

---

## 🔒 Privacy & Security

We believe in privacy by design.

1.  **Bring Your Own Key (BYOK):** You use your own Google Gemini API Key.
2.  **Local Storage:** Your chat history and API key are stored in your browser's local storage (`chrome.storage.local` / `sync`).
3.  **Direct Connection:** The extension communicates directly with Google's servers. **No intermediate servers** collect your data or code.
4.  **Open Source:** You can audit this code to verify these claims.

---

## 🚀 Installation

### From Chrome Web Store
*(Link coming soon)*

### Manual Installation (Developer Mode)

1.  Clone this repository.
2.  Install dependencies and build:
    ```bash
    npm install
    npm run build
    ```
3.  Open Chrome and navigate to `chrome://extensions/`.
4.  Enable **"Developer mode"** (top right).
5.  Click **"Load unpacked"**.
6.  Select the `dist/` folder generated in this project.

---

## 🛠️ Usage

1.  **Setup**: Click the extension icon to open the Side Panel. Click the **Settings (⚙️)** icon and paste your Google Gemini API Key.
2.  **Chat**: Ask anything about programming.
3.  **Context**: Click "Context" (or `Ctrl+J`) to see what code the AI is analyzing.
4.  **Quick Actions**: Use the buttons at the bottom (Explain, Refactor, Fix) to process code visible on your current tab.

---

## 💻 Tech Stack

*   **Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **Testing**: Vitest + React Testing Library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.