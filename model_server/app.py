from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

class TextIn(BaseModel):
    text: str

app = FastAPI(
    title="Emotion Classifier",
    description="提供情绪分类的 POST /predict 接口",
    version="1.0.0",
)

# 新增：根路径健康检查
@app.get("/")
async def health_check():
    return {"status": "alive", "message": "Emotion Classifier is up"}

# 已有的 /predict
classifier = pipeline("text-classification", model="nateraw/bert-base-uncased-emotion")

@app.post("/predict")
async def predict(payload: TextIn):
    res = classifier(payload.text)[0]
    return {"label": res["label"], "score": round(res["score"], 4)}
