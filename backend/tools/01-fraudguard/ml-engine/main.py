"""
FraudGuard ML Engine - Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import logging

from models.fraud_model import FraudDetectionModel
from models.risk_scorer import RiskScorer
from models.anomaly_detector import AnomalyDetector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FraudGuard ML Engine",
    description="Machine Learning Engine for Fraud Detection",
    version="2.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
fraud_model = FraudDetectionModel()
risk_scorer = RiskScorer()
anomaly_detector = AnomalyDetector()


# Pydantic models
class TransactionInput(BaseModel):
    transaction_id: str
    amount: float
    currency: str = "USD"
    user_email: str
    user_ip: str
    device_fingerprint: str
    card_last_four: str
    country: str
    city: Optional[str] = None
    merchant_category: Optional[str] = None
    timestamp: Optional[datetime] = None


class FraudIndicator(BaseModel):
    type: str
    description: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    weight: float = Field(..., ge=0, le=100)


class FraudAnalysisResult(BaseModel):
    transaction_id: str
    score: float = Field(..., ge=0, le=100)
    risk_level: str = Field(..., pattern="^(low|medium|high|critical)$")
    confidence: float = Field(..., ge=0, le=100)
    indicators: List[FraudIndicator]
    model_version: str


class AnomalyResult(BaseModel):
    transaction_id: str
    is_anomaly: bool
    anomaly_score: float
    anomaly_type: str


class ModelInfo(BaseModel):
    model_version: str
    last_trained: str
    accuracy: float
    features: List[str]


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FraudGuard ML Engine",
        "version": "2.0.0",
        "models_loaded": {
            "fraud_detection": fraud_model.is_loaded,
            "risk_scorer": risk_scorer.is_loaded,
            "anomaly_detector": anomaly_detector.is_loaded,
        }
    }


# Analyze transaction
@app.post("/analyze", response_model=FraudAnalysisResult)
async def analyze_transaction(transaction: TransactionInput):
    try:
        logger.info(f"Analyzing transaction {transaction.transaction_id}")
        
        # Get ML prediction
        ml_score, ml_confidence = fraud_model.predict(transaction.model_dump())
        
        # Get rule-based indicators
        indicators = risk_scorer.get_indicators(transaction.model_dump())
        
        # Calculate final score (weighted combination of ML and rules)
        rule_score = sum(ind["weight"] for ind in indicators)
        final_score = (ml_score * 0.7) + (min(rule_score, 100) * 0.3)
        final_score = min(100, max(0, final_score))
        
        # Determine risk level
        if final_score < 30:
            risk_level = "low"
        elif final_score < 60:
            risk_level = "medium"
        elif final_score < 80:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        logger.info(f"Transaction {transaction.transaction_id} - Score: {final_score:.2f} ({risk_level})")
        
        return FraudAnalysisResult(
            transaction_id=transaction.transaction_id,
            score=round(final_score, 2),
            risk_level=risk_level,
            confidence=round(ml_confidence, 2),
            indicators=[FraudIndicator(**ind) for ind in indicators],
            model_version=fraud_model.version
        )
    except Exception as e:
        logger.error(f"Error analyzing transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch analyze
@app.post("/batch-analyze", response_model=List[FraudAnalysisResult])
async def batch_analyze(transactions: List[TransactionInput]):
    if len(transactions) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 transactions per batch")
    
    results = []
    for tx in transactions:
        try:
            result = await analyze_transaction(tx)
            results.append(result)
        except Exception as e:
            logger.error(f"Error analyzing transaction {tx.transaction_id}: {e}")
    
    return results


# Detect anomalies
@app.post("/detect-anomalies", response_model=List[AnomalyResult])
async def detect_anomalies(transactions: List[TransactionInput]):
    try:
        results = []
        for tx in transactions:
            is_anomaly, anomaly_score, anomaly_type = anomaly_detector.detect(tx.model_dump())
            results.append(AnomalyResult(
                transaction_id=tx.transaction_id,
                is_anomaly=is_anomaly,
                anomaly_score=round(anomaly_score, 2),
                anomaly_type=anomaly_type
            ))
        return results
    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get model info
@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        model_version=fraud_model.version,
        last_trained=fraud_model.last_trained,
        accuracy=fraud_model.accuracy,
        features=fraud_model.features
    )


# Explain prediction
@app.get("/explain/{transaction_id}")
async def explain_prediction(transaction_id: str):
    try:
        explanation = fraud_model.explain(transaction_id)
        return explanation
    except Exception as e:
        logger.error(f"Error explaining prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Retrain model (admin only)
@app.post("/retrain")
async def retrain_model():
    try:
        job_id = fraud_model.retrain()
        return {
            "status": "started",
            "message": "Model retraining initiated",
            "job_id": job_id
        }
    except Exception as e:
        logger.error(f"Error initiating retraining: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
