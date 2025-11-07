# API Documentation

This document describes the REST API endpoints for the Gemini AI Assistant backend.

## Authentication

### `POST /api/auth/token`

Exchanges a device code or anonymous session for a JWT.

**Request Body:**

```json
{
  "device_code": "string" (optional),
  "anonymous_session_id": "string" (optional)
}
```

**Response:**

```json
{
  "message": "Token exchange successful",
  "token": "your_jwt_token_here"
}
```

### `GET /api/auth/me`

Returns the capabilities of the current session.

**Response:**

```json
{
  "message": "User capabilities",
  "capabilities": ["summarize", "chat", ...]
}
```

## LLM Endpoints

### `POST /api/llm/chat`

Engages in a chat conversation with the LLM.

**Request Body:**

```json
{
  "messages": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ],
  "model": "ollama:llama3.1" (optional),
  "stream": true (optional, default: false),
  "temperature": 0.7 (optional),
  "top_p": 0.9 (optional),
  "tools": [] (optional)
}
```

**Response (SSE if `stream=true`):**

```
data: {"delta":"Top findings..."}
data: {"delta":"\n- ..."}
data: [DONE]
```

### `POST /api/llm/summarize`

Summarizes the provided text.

**Request Body:**

```json
{
  "text": "The text to summarize.",
  "language": "en" (optional),
  "style": {"tone": "formal", "length": "short"} (optional),
  "citations": [{"sourceId": "doc1", "span": "0-100"}] (optional)
}
```

**Response:**

```json
{
  "message": "Summarize request received",
  "summary": "This is the summarized text."
}
```

### `POST /api/llm/detect-language`

Detects the language of the provided text.

**Request Body:**

```json
{
  "text": "Some text in an unknown language."
}
```

**Response:**

```json
{
  "message": "Language detection request received",
  "language": "en"
}
```

## Embeddings & RAG Endpoints

### `POST /api/rag/embed`

Generates embeddings for a list of texts.

**Request Body:**

```json
{
  "texts": ["text one", "text two"],
  "model": "all-MiniLM-L6-v2" (optional)
}
```

**Response:**

```json
{
  "message": "Embed request received",
  "embeddings": [[0.1, 0.2, ...], [0.3, 0.4, ...]]
}
```

### `POST /api/rag/upsert`

Upserts documents into the RAG store.

**Request Body:**

```json
{
  "docs": [
    {"id": "doc1", "text": "Content of document 1", "metadata": {"title": "Doc 1"}}
  ],
  "namespace": "default" (optional)
}
```

**Response:**

```json
{
  "message": "Upsert request received",
  "status": "success"
}
```

### `POST /api/rag/query`

Queries the RAG store for relevant documents.

**Request Body:**

```json
{
  "query": "What is the capital of France?",
  "top_k": 5 (optional),
  "namespace": "default" (optional),
  "filters": {} (optional)
}
```

**Response:**

```json
{
  "message": "Query request received",
  "results": [
    {"text": "Paris is the capital of France.", "metadata": {}}
  ]
}
```

### `POST /api/rag/answer`

Generates an answer based on a query and retrieved documents.

**Request Body:**

```json
{
  "query": "What is the main topic?",
  "top_k": 3 (optional),
  "namespace": "default" (optional),
  "language": "en" (optional)
}
```

**Response:**

```json
{
  "message": "Answer request received",
  "answer": "The main topic is about AI."
}
```

## OCR Endpoints

### `POST /api/ocr/image`

Performs OCR on an uploaded image.

**Request Body (form-data):**

```
file: <image_file>
```

**Request Body (JSON):**

```json
{
  "image_base64": "base64_encoded_image_string",
  "engine": "paddle" (optional, default: paddle),
  "lang": "en" (optional)
}
```

**Response:**

```json
{
  "message": "OCR image request received",
  "text": "Extracted text from image.",
  "blocks": [
    {"bbox": [x, y, w, h], "type": "paragraph", "confidence": 0.95}
  ]
}
```

### `POST /api/ocr/screenshot`

Performs OCR on a base64 encoded screenshot.

**Request Body:**

```json
{
  "image_base64": "base64_encoded_screenshot_string",
  "lang": "en" (optional)
}
```

**Response:**

```json
{
  "message": "OCR screenshot request received",
  "text": "Extracted text from screenshot.",
  "blocks": [
    {"bbox": [x, y, w, h], "type": "paragraph", "confidence": 0.95}
  ]
}
```

## PDF Endpoints

### `POST /api/pdf/extract`

Extracts text, tables, and other data from a PDF.

**Request Body (form-data):**

```
file: <pdf_file>
```

**Response:**

```json
{
  "message": "PDF extract request received",
  "pages": [
    {
      "page": 1,
      "text": "Text content of page 1.",
      "blocks": [],
      "tables": [
        {"csv": "col1,col2\nval1,val2", "bbox": [x,y,w,h]}
      ]
    }
  ]
}
```

### `POST /api/pdf/answer`

Answers a question based on the content of a PDF.

**Request Body:**

```json
{
  "pdf_id": "string" (optional, if PDF already processed),
  "pages": [] (optional, array of page content),
  "question": "What is the main topic of the document?",
  "language": "en" (optional),
  "return_citations": true (optional)
}
```

**Response:**

```json
{
  "message": "PDF answer request received",
  "answer": "The main topic is about AI."
}
```

## YouTube Endpoints

### `POST /api/youtube/transcript`

Retrieves the transcript for a YouTube video.

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" (optional),
  "videoId": "dQw4w9WgXcQ" (optional),
  "lang_pref": "en" (optional)
}
```

**Response:**

```json
{
  "transcript": [
    {"start": 1.23, "dur": 4.1, "text": "Hello world"}
  ],
  "lang": "en"
}
```

### `POST /api/youtube/asr`

Performs ASR (Automatic Speech Recognition) on a YouTube video if no transcript is available.

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" (optional),
  "videoId": "dQw4w9WgXcQ" (optional)
}
```

**Response:**

```json
{
  "transcript": [
    {"start": 1.23, "dur": 4.1, "text": "Hello world"}
  ],
  "lang": "en"
}
```

### `POST /api/youtube/summarize`

Summarizes a YouTube video.

**Request Body:**

```json
{
  "videoId": "dQw4w9WgXcQ",
  "lang": "en" (optional),
  "style": {"tone": "concise"} (optional)
}
```

**Response:**

```json
{
  "message": "YouTube summarize request received",
  "summary": "A summary of the video."
}
```

### `POST /api/youtube/qa`

Answers a question about a YouTube video.

**Request Body:**

```json
{
  "videoId": "dQw4w9WgXcQ",
  "question": "What is the main topic?",
  "lang": "en" (optional)
}
```

**Response:**

```json
{
  "message": "YouTube Q&A request received",
  "answer": "The main topic is about AI."
}
```

## Speech Endpoints

### `POST /api/speech/stt`

Performs Speech-to-Text on an audio file.

**Request Body (form-data):**

```
file: <audio_file>
```

**Request Body (JSON):**

```json
{
  "audio_base64": "base64_encoded_audio_string",
  "engine": "whisper" (optional, default: whisper),
  "lang": "en" (optional)
}
```

**Response:**

```json
{
  "message": "STT request received",
  "text": "Transcribed text."
}
```

### `POST /api/speech/tts`

Performs Text-to-Speech on provided text.

**Request Body:**

```json
{
  "text": "Hello, world!",
  "lang": "en" (optional),
  "voice": "default" (optional)
}
```

**Response:**

```json
{
  "message": "TTS request received",
  "audio_url": "url_to_generated_audio.mp3"
}
```

## Translate Endpoints

### `POST /api/translate`

Translates text from a source language to a target language.

**Request Body:**

```json
{
  "text": "Hello",
  "source": "en" (optional, auto-detect if not provided),
  "target": "es",
  "engine": "argos" (optional, default: argos)
}
```

**Response:**

```json
{
  "message": "Translate request received",
  "translated_text": "Hola"
}
```
```