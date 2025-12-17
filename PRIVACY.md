# Privacy Policy for Gemini Code Sidecar

**Last Updated:** October 26, 2023

## 1. Introduction
Gemini Code Sidecar ("we", "our", or "the extension") is an open-source browser extension designed to assist developers. We are committed to protecting your privacy. This policy explains how we handle your data.

## 2. Data Collection
**We do not collect, store, or share any personal data, code snippets, or API keys on our own servers.**

The extension operates entirely on your device (Client-Side).

## 3. Google Gemini API Key
To function, the extension requires you to provide a Google Gemini API Key.
*   **Storage:** Your API Key is stored locally on your device using Chrome's secure storage API (`chrome.storage.sync`). It is encrypted by your browser's sync feature.
*   **Usage:** The key is used solely to authenticate requests sent directly from your browser to Google's Generative AI servers.

## 4. Code Snippets and Context
When you use features like "Refactor", "Explain", or "Chat", the extension reads the text or code from the current web page.
*   **Transmission:** This data is sent directly to the Google Gemini API for processing.
*   **Storage:** We do not store this data. It is transient and exists only for the duration of the request and in your local chat history (which you can clear at any time).

## 5. Third-Party Services
*   **Google Gemini API:** The extension interacts with Google's API. Please refer to [Google's Privacy Policy](https://policies.google.com/privacy) and [Google Generative AI Terms](https://ai.google.dev/terms) for information on how they handle data.

## 6. Contact
If you have questions about this policy, please open an issue in our GitHub repository.