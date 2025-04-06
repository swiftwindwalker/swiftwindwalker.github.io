from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, TextStreamer
from fastapi.middleware.cors import CORSMiddleware
import torch
import logging
import asyncio
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Configuration
origins = ["http://localhost:8001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global progress tracker
class GenerationProgress:
    def __init__(self):
        self.current = 0
        self.total = 0
        self.generated_text = ""
        self.is_complete = False

progress = GenerationProgress()

# Model and tokenizer
model = None
tokenizer = None

class CodeAnalysisRequest(BaseModel):
    language: str
    max_length: int
    code: str

class CustomStreamer(TextStreamer):
    def __init__(self, tokenizer, progress):
        super().__init__(tokenizer)
        self.progress = progress
        
    def on_finalized_text(self, text: str, stream_end: bool = False):
        self.progress.current += 1
        self.progress.generated_text = text
        return super().on_finalized_text(text, stream_end)

@app.on_event("startup")
async def startup_event():
    global model, tokenizer
    try:
        model_path = "/Users/ravz/Downloads/MS-phi-2-Models"
        logger.info(f"Loading model from {model_path}")
        
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            trust_remote_code=True,
            device_map="auto",
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        logger.info(f"Model loaded on {model.device}")
        
    except Exception as e:
        logger.error(f"Model loading failed: {str(e)}")
        raise RuntimeError(f"Model loading failed: {str(e)}")

@app.post("/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    try:
        if not model or not tokenizer:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Reset progress tracker
        progress.current = 0
        progress.total = min(request.max_length, 500)
        progress.generated_text = ""
        progress.is_complete = False
        
        prompt = f"Find all the errors in {request.language} code:\n\n{request.code}\n\nShare me detailed explanation and things I can improve upon:"
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024).to(model.device)
        
        streamer = CustomStreamer(tokenizer, progress)
        
        outputs = model.generate(
            **inputs,
            max_new_tokens=progress.total,
            temperature=0.7,
            do_sample=True,
            streamer=streamer
        )
        
        progress.is_complete = True
        analysis = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return {"analysis": analysis.replace(prompt, "").strip()}
        
    except torch.cuda.OutOfMemoryError:
        raise HTTPException(status_code=500, detail="GPU out of memory - try reducing max_length")
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress")
async def get_progress():
    return {
        "current": progress.current,
        "total": progress.total,
        "percent": min(100, int((progress.current / progress.total) * 100)) if progress.total > 0 else 0,
        "generated": progress.generated_text[-200:],  # Last 200 chars
        "is_complete": progress.is_complete
    }

@app.websocket("/ws/progress")
async def websocket_progress(websocket: WebSocket):
    await websocket.accept()
    try:
        while not progress.is_complete:
            await asyncio.sleep(0.5)
            await websocket.send_json({
                "current": progress.current,
                "total": progress.total,
                "percent": min(100, int((progress.current / progress.total) * 100)) if progress.total > 0 else 0,
                "is_complete": progress.is_complete,
                "preview": progress.generated_text[-100:]  # Last 100 chars
            })
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": bool(model),
        "device": str(model.device) if model else "none",
        "cuda_available": torch.cuda.is_available()
    }