
# 🤖 Gemini Code Sidecar

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![Status](https://img.shields.io/badge/status-stable-green)

**Gemini Code Sidecar** es una extensión de navegador diseñada para desarrolladores que necesitan un copiloto de IA potente, integrado y consciente del contexto, sin depender de editores específicos como VS Code. Funciona como un panel lateral persistente que puede "ver" y analizar el código en tu navegador.

---

## ✨ Características Principales

*   **🧠 IA Avanzada**: Integra Google Gemini 2.5 Flash y 3.0 Pro.
*   **👀 Contexto Visual**: Capaz de tomar capturas de pantalla y analizar interfaces.
*   **🔌 Integración Universal**: Lee código de GitHub, GitLab, Monaco Editor, Ace Editor y más.
*   **⚡ Acciones Rápidas**: Refactorización, Explicación, Fix de Bugs y Generación de Tests con un clic.
*   **🗣️ Voz a Código**: Dictado por voz integrado para prompts rápidos.
*   **💾 Historial Persistente**: Tus conversaciones se guardan localmente y de forma segura.
*   **🎨 UI "World Class"**: Interfaz oscura, limpia, responsiva y accesible.

---

## 🚀 Instalación (Modo Desarrollador)

Sigue estos pasos para probar la extensión en tu navegador local (Chrome/Edge/Brave).

### 1. Prerrequisitos
*   Node.js (v18 o superior)
*   NPM o Yarn

### 2. Construcción
Ejecuta el siguiente comando. Esto correrá los tests unitarios y, si pasan, compilará la extensión en la carpeta `dist/`.

```bash
npm run build
```

> **Nota:** Si los tests fallan, la construcción se detendrá para asegurar la calidad del código.

### 3. Cargar en el Navegador
1.  Abre Google Chrome y ve a `chrome://extensions/`.
2.  Activa el **"Modo de desarrollador"** (Developer mode) en la esquina superior derecha.
3.  Haz clic en el botón **"Cargar descomprimida"** (Load unpacked).
4.  Selecciona la carpeta `dist/` que se generó en tu proyecto.

¡Listo! Verás el icono de Gemini Code Sidecar en tu barra de herramientas.

---

## 🛠️ Desarrollo

### Estructura del Proyecto
*   `src/`: Código fuente React/TypeScript.
*   `content.js`: Script inyectado para leer el DOM de la página web.
*   `manifest.json`: Configuración de la extensión (Manifest V3).

### Comandos Útiles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo (útil para UI sin API de Chrome). |
| `npm run test` | Ejecuta la suite de pruebas con Vitest. |
| `npm run build` | **Test + Compilación + Copia de Assets**. |

---

## 🔑 Configuración de API Key

1.  Abre la extensión haciendo clic en el icono o abriendo el Panel Lateral.
2.  Ve al icono de **Configuración (⚙️)**.
3.  Ingresa tu API Key de Google Gemini. Puedes obtener una gratis en [Google AI Studio](https://aistudio.google.com/).
4.  (Opcional) Define una "Instrucción del Sistema" para personalizar la personalidad de la IA.

---

## 🧪 Tests

El proyecto utiliza **Vitest** y **React Testing Library**.

```bash
npm run test
```

Los tests cubren:
*   Componentes UI (Botones, Modales).
*   Hooks personalizados (Reconocimiento de voz, Hotkeys).
*   Servicios lógicos (Cálculo de tokens, Gestión de templates).

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
