"""
FraudGuard ML Engine - Risk Scorer
Rule-based risk scoring with configurable rules
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)


class RiskScorer:
    """
    Rule-based risk scoring system.
    Complements ML model with explicit business rules.
    """
    
    def __init__(self):
        self.is_loaded = True
        self.rules = self._load_rules()
        logger.info(f"Risk Scorer loaded with {len(self.rules)} rules")
    
    def _load_rules(self) -> List[Dict[str, Any]]:
        """Load risk scoring rules"""
        return [
            {
                "id": "high_amount",
                "name": "High Transaction Amount",
                "check": self._check_high_amount,
                "severity": "high",
                "base_weight": 20
            },
            {
                "id": "very_high_amount",
                "name": "Very High Transaction Amount",
                "check": self._check_very_high_amount,
                "severity": "critical",
                "base_weight": 35
            },
            {
                "id": "unknown_device",
                "name": "Unknown Device",
                "check": self._check_unknown_device,
                "severity": "medium",
                "base_weight": 15
            },
            {
                "id": "high_risk_country",
                "name": "High Risk Country",
                "check": self._check_high_risk_country,
                "severity": "high",
                "base_weight": 25
            },
            {
                "id": "disposable_email",
                "name": "Disposable Email",
                "check": self._check_disposable_email,
                "severity": "medium",
                "base_weight": 18
            },
            {
                "id": "unusual_time",
                "name": "Unusual Transaction Time",
                "check": self._check_unusual_time,
                "severity": "low",
                "base_weight": 8
            },
            {
                "id": "prepaid_card",
                "name": "Prepaid Card Usage",
                "check": self._check_prepaid_card,
                "severity": "low",
                "base_weight": 10
            },
            {
                "id": "risky_merchant",
                "name": "High Risk Merchant Category",
                "check": self._check_risky_merchant,
                "severity": "medium",
                "base_weight": 15
            },
            {
                "id": "velocity_check",
                "name": "High Transaction Velocity",
                "check": self._check_velocity,
                "severity": "high",
                "base_weight": 22
            },
            {
                "id": "suspicious_ip",
                "name": "Suspicious IP Address",
                "check": self._check_suspicious_ip,
                "severity": "medium",
                "base_weight": 12
            },
        ]
    
    def _check_high_amount(self, tx: Dict[str, Any]) -> tuple:
        """Check for high transaction amounts"""
        amount = float(tx.get("amount", 0))
        if amount > 5000 and amount <= 10000:
            return True, f"Transaction amount (${amount:,.2f}) exceeds $5,000 threshold"
        return False, None
    
    def _check_very_high_amount(self, tx: Dict[str, Any]) -> tuple:
        """Check for very high transaction amounts"""
        amount = float(tx.get("amount", 0))
        if amount > 10000:
            return True, f"Transaction amount (${amount:,.2f}) exceeds $10,000 threshold"
        return False, None
    
    def _check_unknown_device(self, tx: Dict[str, Any]) -> tuple:
        """Check for unknown or new devices"""
        fingerprint = tx.get("device_fingerprint", "")
        if fingerprint == "unknown" or len(fingerprint) < 10:
            return True, "Transaction from unrecognized or new device"
        return False, None
    
    def _check_high_risk_country(self, tx: Dict[str, Any]) -> tuple:
        """Check for high-risk countries"""
        high_risk = ["XX", "YY", "ZZ", "KP", "IR", "SY", "CU"]
        country = tx.get("country", "").upper()
        if country in high_risk:
            return True, f"Transaction from high-risk country: {country}"
        return False, None
    
    def _check_disposable_email(self, tx: Dict[str, Any]) -> tuple:
        """Check for disposable email domains"""
        disposable = [
            "tempmail.com", "throwaway.com", "fakeemail.com",
            "guerrillamail.com", "mailinator.com", "10minutemail.com",
            "yopmail.com", "trashmail.com"
        ]
        email = tx.get("user_email", "")
        domain = email.split("@")[-1].lower() if "@" in email else ""
        if domain in disposable:
            return True, f"Transaction using disposable email domain: {domain}"
        return False, None
    
    def _check_unusual_time(self, tx: Dict[str, Any]) -> tuple:
        """Check for transactions at unusual times"""
        timestamp = tx.get("timestamp")
        if timestamp:
            try:
                if isinstance(timestamp, str):
                    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                else:
                    dt = timestamp
                hour = dt.hour
                if 1 <= hour <= 5:
                    return True, f"Transaction at unusual hour ({hour}:00)"
            except:
                pass
        return False, None
    
    def _check_prepaid_card(self, tx: Dict[str, Any]) -> tuple:
        """Check for prepaid card usage"""
        card_type = tx.get("card_type", "").lower()
        if card_type == "prepaid":
            return True, "Transaction using prepaid card"
        return False, None
    
    def _check_risky_merchant(self, tx: Dict[str, Any]) -> tuple:
        """Check for high-risk merchant categories"""
        risky_cats = [
            "gambling", "crypto", "cryptocurrency", "adult",
            "money_transfer", "wire_transfer", "gift_card"
        ]
        category = tx.get("merchant_category", "").lower()
        if category in risky_cats:
            return True, f"Transaction with high-risk merchant category: {category}"
        return False, None
    
    def _check_velocity(self, tx: Dict[str, Any]) -> tuple:
        """Check for high transaction velocity (simplified)"""
        # In production, would check against recent transaction history
        return False, None
    
    def _check_suspicious_ip(self, tx: Dict[str, Any]) -> tuple:
        """Check for suspicious IP addresses"""
        ip = tx.get("user_ip", "")
        # Check for private/invalid IPs
        if ip.startswith("0.") or ip == "0.0.0.0" or ip.startswith("127."):
            return True, f"Transaction from suspicious IP address: {ip}"
        return False, None
    
    def get_indicators(self, transaction: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Run all rules and return triggered indicators.
        """
        indicators = []
        
        for rule in self.rules:
            try:
                triggered, description = rule["check"](transaction)
                if triggered:
                    indicators.append({
                        "type": rule["id"],
                        "description": description,
                        "severity": rule["severity"],
                        "weight": rule["base_weight"]
                    })
            except Exception as e:
                logger.error(f"Error running rule {rule['id']}: {e}")
        
        return indicators
    
    def calculate_score(self, transaction: Dict[str, Any]) -> float:
        """
        Calculate total risk score from rules.
        """
        indicators = self.get_indicators(transaction)
        total_weight = sum(ind["weight"] for ind in indicators)
        return min(100, total_weight)


# Singleton instance
_scorer_instance = None

def get_scorer() -> RiskScorer:
    global _scorer_instance
    if _scorer_instance is None:
        _scorer_instance = RiskScorer()
    return _scorer_instance
