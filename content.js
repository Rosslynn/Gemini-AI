
// Escucha mensajes desde el SidePanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_EDITOR_CONTENT") {
    try {
      const code = findCodeInPage();
      sendResponse({ code: code, success: true });
    } catch (e) {
      console.error("Gemini AI: Error extracting code", e);
      sendResponse({ code: "", success: false, error: e.message });
    }
  } 
  else if (request.action === "GET_PAGE_TEXT") {
      try {
          const text = getVisibleText();
          sendResponse({ text: text, success: true });
      } catch (e) {
          sendResponse({ text: "", success: false });
      }
  }
  return true; 
});

// Heurística para obtener el "contenido principal" de texto, ignorando menús/footers obvios
function getVisibleText() {
    // Si estamos en Github/Gitlab y es un blob
    const blobWrapper = document.querySelector('.blob-wrapper, .blob-content');
    if (blobWrapper) return blobWrapper.innerText;

    // Si es una página de documentación (suele estar en <main> o <article>)
    const main = document.querySelector('main, article, #content, .content');
    if (main) return main.innerText;

    // Fallback: Body completo pero intentando limpiar ruido
    return document.body.innerText;
}

function findCodeInPage() {
  // 1. Selección del usuario (Prioridad máxima)
  const selection = window.getSelection().toString();
  if (selection && selection.length > 5) return selection;

  // 2. CodeMirror
  const cmLines = document.querySelectorAll('.CodeMirror-line');
  if (cmLines.length > 0) {
    const lines = Array.from(cmLines).map(line => line.textContent.replace(/\u200B/g, ''));
    return lines.join('\n');
  }

  // 3. Mónaco Editor (VS Code web)
  const monacoLines = document.querySelectorAll('.monaco-editor .view-line');
  if (monacoLines.length > 0) {
    const lines = Array.from(monacoLines).map(line => line.innerText);
    return lines.join('\n');
  }

  // 4. Ace Editor
  const aceContent = document.querySelector('.ace_content');
  if (aceContent) return aceContent.innerText;

  // 5. Elementos nativos <pre>
  const pre = document.querySelector('pre');
  if (pre) return pre.innerText;

  // 6. Textarea genérico grande
  const textareas = Array.from(document.querySelectorAll('textarea'));
  const validTextareas = textareas.filter(t => t.offsetWidth > 100 && t.offsetHeight > 50);
  
  if (validTextareas.length > 0) {
    const largest = validTextareas.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
    return largest.value;
  }

  return "";
}
