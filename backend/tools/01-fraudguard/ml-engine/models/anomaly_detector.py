"""
FraudGuard ML Engine - Anomaly Detector
Statistical anomaly detection for transaction patterns
"""

import numpy as np
import logging
from typing import Dict, Any, Tuple, List
from datetime import datetime

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Anomaly detection using statistical methods and isolation forest.
    Detects unusual patterns that may indicate fraud.
    """
    
    def __init__(self):
        self.is_loaded = True
        self.threshold = 0.7  # Anomaly score threshold
        
        # Simulated baseline statistics (would be computed from historical data)
        self.baselines = {
            "amount_mean": 250.0,
            "amount_std": 500.0,
            "hourly_distribution": self._create_hourly_baseline(),
            "country_frequency": self._create_country_baseline(),
        }
        
        logger.info("Anomaly Detector loaded")
    
    def _create_hourly_baseline(self) -> Dict[int, float]:
        """Create hourly transaction distribution baseline"""
        # Normal business hours have higher transaction volume
        return {
            0: 0.02, 1: 0.01, 2: 0.01, 3: 0.01, 4: 0.01, 5: 0.02,
            6: 0.03, 7: 0.04, 8: 0.06, 9: 0.08, 10: 0.09, 11: 0.10,
            12: 0.09, 13: 0.08, 14: 0.08, 15: 0.07, 16: 0.06, 17: 0.05,
            18: 0.04, 19: 0.03, 20: 0.03, 21: 0.02, 22: 0.02, 23: 0.02
        }
    
    def _create_country_baseline(self) -> Dict[str, float]:
        """Create country frequency baseline"""
        return {
            "US": 0.45, "GB": 0.10, "CA": 0.08, "AU": 0.05,
            "DE": 0.04, "FR": 0.04, "JP": 0.03, "OTHER": 0.21
        }
    
    def _calculate_amount_anomaly(self, amount: float) -> float:
        """Calculate anomaly score based on transaction amount"""
        z_score = abs(amount - self.baselines["amount_mean"]) / self.baselines["amount_std"]
        # Map z-score to 0-1 range
        return min(1.0, z_score / 4)  # z-score of 4+ is considered fully anomalous
    
    def _calculate_time_anomaly(self, timestamp: datetime) -> float:
        """Calculate anomaly score based on transaction time"""
        hour = timestamp.hour
        expected_freq = self.baselines["hourly_distribution"].get(hour, 0.02)
        # Lower frequency hours are more anomalous
        return 1.0 - (expected_freq * 10)  # Scale to 0-1
    
    def _calculate_location_anomaly(self, country: str) -> float:
        """Calculate anomaly score based on location"""
        freq = self.baselines["country_frequency"].get(country.upper(), 0.01)
        if freq < 0.02:  # Very rare country
            return 0.8
        elif freq < 0.05:  # Uncommon country
            return 0.5
        else:
            return 0.2
    
    def _calculate_pattern_anomaly(self, transaction: Dict[str, Any]) -> float:
        """Calculate overall pattern anomaly score"""
        scores = []
        
        # Amount anomaly
        amount = float(transaction.get("amount", 0))
        scores.append(self._calculate_amount_anomaly(amount))
        
        # Time anomaly
        timestamp = transaction.get("timestamp")
        if timestamp:
            try:
                if isinstance(timestamp, str):
                    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                else:
                    dt = timestamp
                scores.append(self._calculate_time_anomaly(dt))
            except:
                scores.append(0.5)
        
        # Location anomaly
        country = transaction.get("country", "")
        if country:
            scores.append(self._calculate_location_anomaly(country))
        
        # Device anomaly (new devices are more suspicious)
        device_fp = transaction.get("device_fingerprint", "")
        if device_fp == "unknown" or len(device_fp) < 10:
            scores.append(0.7)
        else:
            scores.append(0.2)
        
        # Weighted average of all anomaly scores
        if scores:
            return sum(scores) / len(scores)
        return 0.5
    
    def detect(self, transaction: Dict[str, Any]) -> Tuple[bool, float, str]:
        """
        Detect if a transaction is anomalous.
        Returns (is_anomaly, anomaly_score, anomaly_type)
        """
        try:
            anomaly_score = self._calculate_pattern_anomaly(transaction)
            is_anomaly = anomaly_score >= self.threshold
            
            # Determine anomaly type
            if is_anomaly:
                amount = float(transaction.get("amount", 0))
                if amount > self.baselines["amount_mean"] + 3 * self.baselines["amount_std"]:
                    anomaly_type = "amount_outlier"
                elif transaction.get("device_fingerprint", "") == "unknown":
                    anomaly_type = "new_device"
                else:
                    anomaly_type = "pattern_deviation"
            else:
                anomaly_type = "normal"
            
            return is_anomaly, anomaly_score, anomaly_type
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return False, 0.5, "error"
    
    def batch_detect(self, transactions: List[Dict[str, Any]]) -> List[Tuple[bool, float, str]]:
        """Detect anomalies in a batch of transactions"""
        return [self.detect(tx) for tx in transactions]
    
    def update_baselines(self, transactions: List[Dict[str, Any]]):
        """Update baselines with new transaction data"""
        if not transactions:
            return
        
        # Update amount statistics
        amounts = [float(tx.get("amount", 0)) for tx in transactions]
        self.baselines["amount_mean"] = np.mean(amounts)
        self.baselines["amount_std"] = max(np.std(amounts), 1.0)  # Avoid division by zero
        
        logger.info("Baselines updated with new transaction data")


# Singleton instance
_detector_instance = None

def get_detector() -> AnomalyDetector:
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = AnomalyDetector()
    return _detector_instance
