# ✨ AI Chat Assistant (ChatGPT & Gemini Clone)

A modern, responsive, full-stack AI Chat web application built with Python FastAPI and vanilla HTML5/CSS3/JavaScript.

## 🚀 Features

- **ChatGPT & Gemini Experience**: Real-time token streaming (Server-Sent Events) with live typing cursor.
- **Multiple Models**:
  - **Google Gemini**: Gemini 2.0 Flash, Gemini 1.5 Flash, Gemini 1.5 Pro.
  - **OpenAI**: GPT-4o, GPT-4o Mini.
  - **Offline Demo Assistant**: Pre-configured assistant that works immediately without any API key required!
- **Markdown & Code Highlighting**: Syntax highlighting for all programming languages with a 1-click **Copy Code** button.
- **Persistent Chat Sessions**: Create multiple chats, switch conversations, rename, and delete sessions (saved in browser storage).
- **Dark / Light Mode**: Beautiful modern UI theme switcher.
- **In-Browser Settings**: Enter and manage API keys and system prompts directly from the web interface or via `.env`.

---

## 🏃 Quick Start

### Option 1: Double-Click (Windows)
Double-click `run.bat` to automatically install requirements and launch the website in your browser.

### Option 2: Command Line
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   python app.py
   ```
3. Open your browser at:
   [http://localhost:8000](http://localhost:8000)

---

## 🔑 Adding API Keys (Optional)

You can use the website immediately in **Demo Assistant** mode. To unlock live AI models:

1. **Google Gemini (Free tier available)**:
   - Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Enter it in the website by clicking **⚙️ Settings** in the top right header, or add `GEMINI_API_KEY=your_key_here` to a `.env` file.

2. **OpenAI (ChatGPT)**:
   - Get a key at [OpenAI Platform](https://platform.openai.com/api-keys).
   - Enter it in **⚙️ Settings** or add `OPENAI_API_KEY=your_key_here` to `.env`.
