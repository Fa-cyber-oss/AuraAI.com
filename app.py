import os
import json
import asyncio
from typing import List, Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import httpx

load_dotenv()

app = FastAPI(title="AI Chat Assistant", version="1.0.0")

STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)

class ChatMessage(BaseModel):
    role: str  # 'user', 'assistant', 'system'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gemini-3.6-flash"
    apiKey: Optional[str] = None
    temperature: Optional[float] = 0.7
    systemPrompt: Optional[str] = "You are a helpful, knowledgeable, and friendly AI assistant. Answer clearly with markdown formatting when appropriate."

MODEL_ALIASES = {
    "gemini-2.0-flash": "gemini-3.6-flash",
    "gemini-2.0": "gemini-3.6-flash"
}

MODELS = [
    {
        "id": "gemini-3.6-flash",
        "name": "Gemini 3.6 Flash (Recommended)",
        "provider": "google",
        "description": "Google's latest ultra-fast model with state-of-the-art reasoning.",
        "requiresKey": "gemini"
    },
    {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "provider": "google",
        "description": "Google's high-efficiency lightweight model.",
        "requiresKey": "gemini"
    },
    {
        "id": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash",
        "provider": "google",
        "description": "High-speed, lightweight model for everyday queries.",
        "requiresKey": "gemini"
    },
    {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro",
        "provider": "google",
        "description": "Google's advanced model for complex reasoning and coding.",
        "requiresKey": "gemini"
    },
    {
        "id": "gpt-4o",
        "name": "GPT-4o (OpenAI)",
        "provider": "openai",
        "description": "OpenAI's flagship omni model for high intelligence.",
        "requiresKey": "openai"
    },
    {
        "id": "gpt-4o-mini",
        "name": "GPT-4o Mini (OpenAI)",
        "provider": "openai",
        "description": "Affordable, high-speed OpenAI model.",
        "requiresKey": "openai"
    },
    {
        "id": "demo",
        "name": "Offline Demo Assistant",
        "provider": "demo",
        "description": "Works immediately without any API key for instant testing.",
        "requiresKey": None
    }
]

def get_api_key(provider: str, user_key: Optional[str] = None) -> Optional[str]:
    if user_key and user_key.strip():
        return user_key.strip()
    if provider == "google":
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    elif provider == "openai":
        return os.getenv("OPENAI_API_KEY")
    return None

@app.get("/api/models")
async def list_models():
    gemini_has_server_key = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))
    openai_has_server_key = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "models": MODELS,
        "serverKeysConfigured": {
            "gemini": gemini_has_server_key,
            "openai": openai_has_server_key
        }
    }

async def stream_demo(messages: List[ChatMessage]):
    user_query = messages[-1].content.strip() if messages else ""
    q_lower = user_query.lower()

    if any(w in q_lower for w in ["hi", "hello", "hey", "who are you", "what's up", "namaste"]):
        response = (
            f"### Hello! 👋\n\n"
            f"I am your **AI Chat Assistant**. You can ask me **anything**:\n\n"
            f"- 🧠 **General Knowledge & Science**: Ask about any topic, concept, or historical event.\n"
            f"- 💻 **Coding & Debugging**: Python, JavaScript, HTML/CSS, algorithms, and more.\n"
            f"- ✍️ **Writing & Creative Work**: Essays, emails, stories, and summaries.\n"
            f"- 💡 **Problem Solving & Brainstorming**: Business ideas, plans, math problems.\n\n"
            f"What would you like to explore or solve right now?"
        )
    elif any(w in q_lower for w in ["python", "javascript", "code", "html", "css", "sql", "function", "script", "program", "debug"]):
        lang = "python"
        if "javascript" in q_lower or "js" in q_lower:
            lang = "javascript"
        elif "html" in q_lower:
            lang = "html"
        elif "sql" in q_lower:
            lang = "sql"

        response = (
            f"### Code Solution for: *\"{user_query}\"*\n\n"
            f"Here is a complete, working example implementation:\n\n"
            f"```{lang}\n"
            f"# Solution for: {user_query}\n"
            f"def execute_task(data):\n"
            f"    \"\"\"\n"
            f"    Processes the input and returns the optimized result.\n"
            f"    \"\"\"\n"
            f"    result = [item.strip() for item in str(data).split() if item]\n"
            f"    return result\n"
            f"\n"
            f"# Example run\n"
            f"sample_input = {repr(user_query)}\n"
            f"output = execute_task(sample_input)\n"
            f"print('Processed output:', output)\n"
            f"```\n\n"
            f"#### ⚙️ How it works:\n"
            f"1. **Input Handling**: Sanitizes and structures the incoming input data.\n"
            f"2. **Processing**: Applies clean transformations efficiently.\n"
            f"3. **Output**: Returns the structured result ready for your application.\n\n"
            f"> [!TIP]\n"
            f"> Click the **Copy** button in the code header to instantly copy this snippet to your clipboard!"
        )
    elif any(w in q_lower for w in ["email", "letter", "message", "write a", "draft", "story", "poem"]):
        response = (
            f"### Draft: Response to *\"{user_query}\"*\n\n"
            f"---\n\n"
            f"**Subject:** Follow-up & Discussion regarding {user_query[:35]}\n\n"
            f"Dear Team / Colleague,\n\n"
            f"I hope this message finds you well.\n\n"
            f"I am writing to follow up regarding **{user_query}**. I wanted to share a few key thoughts and ensure we are aligned on the next steps:\n\n"
            f"- **Overview**: Addressing the core objectives clearly and directly.\n"
            f"- **Key Milestone**: Ensuring all deliverables meet the expected quality and timeline.\n"
            f"- **Next Action**: Please review the details at your earliest convenience and let me know your thoughts.\n\n"
            f"Thank you for your time and collaboration.\n\n"
            f"Warm regards,\n\n"
            f"*[Your Name]*  \n"
            f"*[Your Contact Information]*\n\n"
            f"---\n"
            f"*Feel free to edit or customize any names, dates, or specific details above.*"
        )
    else:
        response = (
            f"### Answer: *\"{user_query}\"*\n\n"
            f"Here is a comprehensive breakdown answering your query:\n\n"
            f"#### 1. Core Overview\n"
            f"Regarding **{user_query}**, the fundamental concept centers around understanding the underlying principles and practical applications.\n\n"
            f"#### 2. Key Aspects & Insights\n"
            f"- **Primary Principle**: It operates through structured methods designed to maximize efficiency and clarity.\n"
            f"- **Application**: Can be applied directly in everyday problem-solving, academic studies, or technical development.\n"
            f"- **Best Practice**: Start with fundamental requirements before optimizing or scaling.\n\n"
            f"#### 3. Practical Summary\n"
            f"Whether exploring this theoretically or applying it practically, breaking the problem into discrete, actionable steps yields the most consistent results.\n\n"
            f"---\n"
            f"*💡 **Connected to Live Gemini?** When you use your Google Gemini key in **⚙️ Settings**, Google's real-time AI will deliver extensive, live-generated answers for any topic!*"
        )

    # Stream out tokens with realistic pacing
    chunks = response.split(" ")
    for i, chunk in enumerate(chunks):
        piece = chunk + (" " if i < len(chunks) - 1 else "")
        yield f"data: {json.dumps({'content': piece})}\n\n"
        await asyncio.sleep(0.015)
    yield "data: [DONE]\n\n"

async def stream_gemini(model_id: str, messages: List[ChatMessage], api_key: str, temperature: float, system_prompt: Optional[str]):
    # Resolve aliases (e.g. gemini-2.0-flash -> gemini-3.6-flash)
    model_id = MODEL_ALIASES.get(model_id, model_id)

    # Format messages for Gemini API
    gemini_contents = []
    for msg in messages:
        role = "user" if msg.role == "user" else "model"
        gemini_contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })

    payload: Dict[str, Any] = {
        "contents": gemini_contents,
        "generationConfig": {
            "temperature": temperature
        }
    }
    if system_prompt:
        payload["systemInstruction"] = {
            "parts": [{"text": system_prompt}]
        }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:streamGenerateContent?alt=sse&key={api_key}"
            async with client.stream("POST", url, json=payload, headers={"Content-Type": "application/json"}) as resp:
                if resp.status_code != 200:
                    error_text = await resp.aread()
                    try:
                        err_json = json.loads(error_text.decode())
                        msg = err_json.get("error", {}).get("message", error_text.decode())
                    except Exception:
                        msg = error_text.decode()

                    # Auto-fallback if the selected model is not found / deprecated
                    if resp.status_code == 404 and model_id != "gemini-3.6-flash":
                        fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key={api_key}"
                        async with client.stream("POST", fallback_url, json=payload, headers={"Content-Type": "application/json"}) as fallback_resp:
                            if fallback_resp.status_code == 200:
                                buffer = ""
                                async for chunk in fallback_resp.aiter_text():
                                    buffer += chunk
                                    lines = buffer.split("\n")
                                    buffer = lines.pop()
                                    for line in lines:
                                        line = line.strip()
                                        if line.startswith("data: "):
                                            json_str = line[6:]
                                            try:
                                                data = json.loads(json_str)
                                                candidates = data.get("candidates", [])
                                                if candidates:
                                                    parts = candidates[0].get("content", {}).get("parts", [])
                                                    for part in parts:
                                                        text = part.get("text", "")
                                                        if text:
                                                            yield f"data: {json.dumps({'content': text})}\n\n"
                                            except Exception:
                                                pass
                                yield "data: [DONE]\n\n"
                                return

                    yield f"data: {json.dumps({'error': f'Gemini API Error ({resp.status_code}): {msg}'})}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                buffer = ""
                async for chunk in resp.aiter_text():
                    buffer += chunk
                    lines = buffer.split("\n")
                    buffer = lines.pop()  # Keep incomplete line in buffer

                    for line in lines:
                        line = line.strip()
                        if line.startswith("data: "):
                            json_str = line[6:]
                            try:
                                data = json.loads(json_str)
                                candidates = data.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    for part in parts:
                                        text = part.get("text", "")
                                        if text:
                                            yield f"data: {json.dumps({'content': text})}\n\n"
                            except Exception:
                                pass
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Network / Gemini Error: {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"
            return

    yield "data: [DONE]\n\n"

async def stream_openai(model_id: str, messages: List[ChatMessage], api_key: str, temperature: float, system_prompt: Optional[str]):
    formatted_messages = []
    if system_prompt:
        formatted_messages.append({"role": "system", "content": system_prompt})

    for msg in messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })

    payload = {
        "model": model_id,
        "messages": formatted_messages,
        "temperature": temperature,
        "stream": True
    }

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            async with client.stream("POST", url, json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    error_text = await resp.aread()
                    try:
                        err_json = json.loads(error_text.decode())
                        msg = err_json.get("error", {}).get("message", error_text.decode())
                    except Exception:
                        msg = error_text.decode()
                    yield f"data: {json.dumps({'error': f'OpenAI API Error ({resp.status_code}): {msg}'})}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                buffer = ""
                async for chunk in resp.aiter_text():
                    buffer += chunk
                    lines = buffer.split("\n")
                    buffer = lines.pop()

                    for line in lines:
                        line = line.strip()
                        if line == "data: [DONE]":
                            yield "data: [DONE]\n\n"
                            return
                        if line.startswith("data: "):
                            json_str = line[6:]
                            try:
                                data = json.loads(json_str)
                                choices = data.get("choices", [])
                                if choices:
                                    delta = choices[0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        yield f"data: {json.dumps({'content': content})}\n\n"
                            except Exception:
                                pass
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Network / OpenAI Error: {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"
            return

    yield "data: [DONE]\n\n"

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    model_id = MODEL_ALIASES.get(req.model, req.model)
    model_info = next((m for m in MODELS if m["id"] == model_id), None)
    provider = model_info["provider"] if model_info else "demo"

    # If demo mode requested or no model info found
    if provider == "demo" or model_id == "demo":
        return StreamingResponse(stream_demo(req.messages), media_type="text/event-stream")

    api_key = get_api_key(provider, req.apiKey)

    if not api_key:
        # If user selected Gemini or OpenAI but no key is configured,
        # fallback gracefully to demo with a helpful hint!
        async def key_missing_stream():
            missing_text = (
                f"### 🔑 API Key Needed for {model_id}\n\n"
                f"You selected **{model_id}**, but no API key was provided.\n\n"
                f"**How to add your key:**\n"
                f"1. Click the **⚙️ Settings** icon in the top right header.\n"
                f"2. Paste your {'Google Gemini API Key (free at aistudio.google.com)' if provider == 'google' else 'OpenAI API Key (platform.openai.com)'}.\n"
                f"3. Click **Save Settings**.\n\n"
                f"*Alternatively, select the **Offline Demo Assistant** in the model dropdown to chat immediately without a key!*"
            )
            for chunk in missing_text.split(" "):
                yield f"data: {json.dumps({'content': chunk + ' '})}\n\n"
                await asyncio.sleep(0.015)
            yield "data: [DONE]\n\n"
        return StreamingResponse(key_missing_stream(), media_type="text/event-stream")

    if provider == "google":
        return StreamingResponse(
            stream_gemini(model_id, req.messages, api_key, req.temperature, req.systemPrompt),
            media_type="text/event-stream"
        )
    elif provider == "openai":
        return StreamingResponse(
            stream_openai(model_id, req.messages, api_key, req.temperature, req.systemPrompt),
            media_type="text/event-stream"
        )
    else:
        return StreamingResponse(stream_demo(req.messages), media_type="text/event-stream")

# Serve Frontend static assets
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")

if __name__ == "__main__":
    import uvicorn
    print("Starting AI Chat Website at http://localhost:8000 ...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
