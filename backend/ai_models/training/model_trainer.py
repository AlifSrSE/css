from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split, cross_val_score
import joblib
import numpy as np
from typing import Dict, Any, Tuple
import logging
from datetime import datetime
import os

from .data_preprocessor import CreditDataPreprocessor

logger = logging.getLogger(__name__)

class CreditScoringModelTrainer:
    """Train and evaluate credit scoring models"""
    
    def __init__(self, model_save_path: str = 'ai_models/models/saved_models/'):
        self.model_save_path = model_save_path
        self.preprocessor = CreditDataPreprocessor()
        self.models = {}
        self.model_performance = {}
        
        # Ensure save directory exists
        os.makedirs(model_save_path, exist_ok=True)
    
    def train_models(self, training_data: list) -> Dict[str, Any]:
        """Train multiple credit scoring models"""
        try:
            logger.info("Starting model training process...")
            
            # Preprocess data
            X, y = self.preprocessor.preprocess_training_data(training_data)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            logger.info(f"Training set size: {X_train.shape[0]}, Test set size: {X_test.shape[0]}")
            
            # Define models to train
            model_configs = {
                'random_forest': RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    min_samples_split=5,
                    min_samples_leaf=2,
                    random_state=42
                ),
                'gradient_boosting': GradientBoostingClassifier(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=6,
                    random_state=42
                ),
                'logistic_regression': LogisticRegression(
                    random_state=42,
                    max_iter=1000
                )
            }
            
            # Train and evaluate each model
            training_results = {}
            
            for model_name, model in model_configs.items():
                logger.info(f"Training {model_name}...")
                
                # Train model
                model.fit(X_train, y_train)
                
                # Evaluate model
                performance = self._evaluate_model(model, X_test, y_test)
                
                # Store model and performance
                self.models[model_name] = model
                self.model_performance[model_name] = performance
                
                # Save model
                model_filename = f"{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
                model_path = os.path.join(self.model_save_path, model_filename)
                joblib.dump({
                    'model': model,
                    'preprocessor': self.preprocessor,
                    'performance': performance,
                    'feature_columns': self.preprocessor.feature_columns,
                    'training_date': datetime.now().isoformat()
                }, model_path)
                
                training_results[model_name] = {
                    'model_path': model_path,
                    'performance': performance
                }
                
                logger.info(f"{model_name} training completed. Accuracy: {performance['accuracy']:.4f}")
            
            # Select best model
            best_model_name = max(training_results.keys(), 
                                key=lambda x: training_results[x]['performance']['accuracy'])
            
            # Save best model as default
            best_model_path = os.path.join(self.model_save_path, 'best_model.joblib')
            joblib.dump({
                'model': self.models[best_model_name],
                'preprocessor': self.preprocessor,
                'performance': self.model_performance[best_model_name],
                'feature_columns': self.preprocessor.feature_columns,
                'training_date': datetime.now().isoformat(),
                'model_type': best_model_name
            }, best_model_path)
            
            logger.info(f"Best model ({best_model_name}) saved as default model")
            
            return {
                'status': 'completed',
                'models_trained': list(training_results.keys()),
                'best_model': best_model_name,
                'training_results': training_results,
                'training_samples': len(training_data)
            }
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise
    
    def _evaluate_model(self, model, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance"""
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else y_pred
        
        # Calculate metrics
        performance = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1_score': f1_score(y_test, y_pred, average='weighted'),
            'roc_auc': roc_auc_score(y_test, y_pred_proba) if len(np.unique(y_test)) > 1 else 0.5
        }
        
        # Calculate precision and recall by class
        for class_label in np.unique(y_test):
            class_mask = (y_test == class_label)
            class_pred_mask = (y_pred == class_label)
            
            if np.sum(class_mask) > 0:
                performance[f'precision_class_{class_label}'] = precision_score(
                    class_mask, class_pred_mask, average='binary'
                )
                performance[f'recall_class_{class_label}'] = recall_score(
                    class_mask, class_pred_mask, average='binary'
                )
        
        return performance
    
    def retrain_model(self, model_name: str, new_training_data: list) -> Dict[str, Any]:
        """Retrain existing model with new data"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not found")
            
            logger.info(f"Retraining {model_name} with {len(new_training_data)} new samples")
            
            # Preprocess new data
            X_new, y_new = self.preprocessor.preprocess_training_data(new_training_data)
            
            # Get existing model
            model = self.models[model_name]
            
            # Retrain (this is simplified - in practice you might want incremental learning)
            model.fit(X_new, y_new)
            
            # Update stored model
            self.models[model_name] = model
            
            # Save retrained model
            model_filename = f"{model_name}_retrained_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
            model_path = os.path.join(self.model_save_path, model_filename)
            
            joblib.dump({
                'model': model,
                'preprocessor': self.preprocessor,
                'feature_columns': self.preprocessor.feature_columns,
                'training_date': datetime.now().isoformat(),
                'retrained': True
            }, model_path)
            
            return {
                'status': 'completed',
                'model_name': model_name,
                'model_path': model_path,
                'samples_used': len(new_training_data)
            }
            
        except Exception as e:
            logger.error(f"Model retraining failed: {str(e)}")
            raise
