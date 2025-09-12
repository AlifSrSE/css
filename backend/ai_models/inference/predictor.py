import joblib
import numpy as np
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)

class CreditScoringPredictor:
    """Make predictions using trained credit scoring models"""
    
    def __init__(self, model_path: str = None):
        self.model = None
        self.preprocessor = None
        self.feature_columns = []
        self.model_info = {}
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str) -> None:
        """Load trained model"""
        try:
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load model data
            model_data = joblib.load(model_path)
            
            self.model = model_data['model']
            self.preprocessor = model_data['preprocessor']
            self.feature_columns = model_data.get('feature_columns', [])
            self.model_info = {
                'performance': model_data.get('performance', {}),
                'training_date': model_data.get('training_date'),
                'model_type': model_data.get('model_type', 'unknown')
            }
            
            logger.info(f"Model loaded successfully from {model_path}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def predict_default_probability(self, application_data: Dict) -> Dict[str, Any]:
        """Predict default probability for an application"""
        try:
            if not self.model:
                raise ValueError("No model loaded")
            
            # Preprocess application data
            processed_data = self.preprocessor.preprocess_prediction_data(application_data)
            
            # Make prediction
            prediction_proba = self.model.predict_proba(processed_data)
            default_probability = prediction_proba[0][1]  # Probability of class 1 (default)
            
            # Make binary prediction
            prediction = self.model.predict(processed_data)[0]
            
            # Get confidence score
            confidence = max(prediction_proba[0])
            
            return {
                'default_probability': float(default_probability),
                'predicted_default': bool(prediction),
                'confidence': float(confidence),
                'risk_level': self._determine_risk_level(default_probability),
                'model_info': self.model_info
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def predict_grade_adjustment(self, application_data: Dict, current_grade: str) -> Dict[str, Any]:
        """Predict grade adjustment based on ML model"""
        try:
            prediction_result = self.predict_default_probability(application_data)
            default_prob = prediction_result['default_probability']
            
            # Grade adjustment logic based on ML prediction
            adjustment = None
            confidence = prediction_result['confidence']
            
            if default_prob < 0.05 and confidence > 0.8:
                if current_grade == 'B':
                    adjustment = 'upgrade_to_A'
                elif current_grade == 'C':
                    adjustment = 'upgrade_to_B'
            elif default_prob > 0.25 and confidence > 0.75:
                if current_grade == 'A':
                    adjustment = 'downgrade_to_B'
                elif current_grade == 'B':
                    adjustment = 'downgrade_to_C'
                elif current_grade == 'C':
                    adjustment = 'downgrade_to_R'
            
            return {
                'current_grade': current_grade,
                'suggested_adjustment': adjustment,
                'default_probability': default_prob,
                'confidence': confidence,
                'reasoning': self._generate_adjustment_reasoning(default_prob, current_grade, adjustment)
            }
            
        except Exception as e:
            logger.error(f"Grade adjustment prediction failed: {str(e)}")
            raise
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from the model"""
        try:
            if not hasattr(self.model, 'feature_importances_'):
                return {}
            
            importance_dict = {}
            for feature, importance in zip(self.feature_columns, self.model.feature_importances_):
                importance_dict[feature] = float(importance)
            
            # Sort by importance
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
            
        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return {}
    
    def _determine_risk_level(self, default_probability: float) -> str:
        """Determine risk level based on default probability"""
        if default_probability < 0.05:
            return 'low'
        elif default_probability < 0.15:
            return 'medium'
        elif default_probability < 0.35:
            return 'high'
        else:
            return 'very_high'
    
    def _generate_adjustment_reasoning(self, default_prob: float, current_grade: str, 
                                     adjustment: Optional[str]) -> str:
        """Generate reasoning for grade adjustment"""
        if not adjustment:
            return f"Current grade {current_grade} is appropriate based on {default_prob:.2%} default probability"
        
        if 'upgrade' in adjustment:
            return f"Low default risk ({default_prob:.2%}) suggests potential for grade improvement"
        elif 'downgrade' in adjustment:
            return f"High default risk ({default_prob:.2%}) suggests grade should be lowered"
        
        return "No adjustment recommended"
