import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import logging

logger = logging.getLogger(__name__)

class CreditDataPreprocessor:
    """Data preprocessing for credit scoring ML models"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.feature_columns = []
        self.target_column = 'default_status'
        
    def preprocess_training_data(self, applications_data: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocess training data from applications and scores"""
        try:
            # Convert to DataFrame
            df = self._convert_to_dataframe(applications_data)
            
            # Feature engineering
            df = self._engineer_features(df)
            
            # Handle missing values
            df = self._handle_missing_values(df)
            
            # Encode categorical variables
            df = self._encode_categorical_features(df)
            
            # Scale numerical features
            df = self._scale_numerical_features(df)
            
            # Separate features and target
            X = df.drop(columns=[self.target_column]).values
            y = df[self.target_column].values
            
            # Store feature columns for later use
            self.feature_columns = df.drop(columns=[self.target_column]).columns.tolist()
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preprocessing training data: {str(e)}")
            raise
    
    def preprocess_prediction_data(self, application_data: Dict) -> np.ndarray:
        """Preprocess single application for prediction"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame([application_data])
            
            # Feature engineering
            df = self._engineer_features(df)
            
            # Handle missing values
            df = self._handle_missing_values(df)
            
            # Encode categorical variables (using fitted encoders)
            df = self._encode_categorical_features(df, fit=False)
            
            # Scale numerical features (using fitted scalers)
            df = self._scale_numerical_features(df, fit=False)
            
            # Ensure all feature columns are present
            for col in self.feature_columns:
                if col not in df.columns:
                    df[col] = 0
            
            # Select and order features
            df = df[self.feature_columns]
            
            return df.values
            
        except Exception as e:
            logger.error(f"Error preprocessing prediction data: {str(e)}")
            raise
    
    def _convert_to_dataframe(self, applications_data: List[Dict]) -> pd.DataFrame:
        """Convert applications data to DataFrame"""
        records = []
        
        for data in applications_data:
            application = data['application']
            score = data['score']
            
            record = {
                # Borrower info
                'years_of_residency': application.borrower_info.years_of_residency or 0,
                'residency_status': application.borrower_info.residency_status,
                'guarantor_category': application.borrower_info.guarantor_category or 'medium',
                
                # Business data
                'business_type': application.business_data.business_type,
                'years_of_operation': application.business_data.years_of_operation or 0,
                'seller_type': application.business_data.seller_type or 'retailer',
                'average_daily_sales': float(application.business_data.average_daily_sales or 0),
                'last_month_sales': float(application.business_data.last_month_sales or 0),
                'inventory_value': float(application.business_data.inventory_value_present or 0),
                'total_expense_ratio': self._calculate_expense_ratio(application.business_data),
                'rent_advance': float(application.business_data.rent_advance or 0),
                
                # Financial data
                'monthly_income': float(application.financial_data.monthly_income or 0),
                'existing_loan_count': len(application.financial_data.existing_loans),
                'total_outstanding_debt': sum([float(loan.outstanding_loan) for loan in application.financial_data.existing_loans]),
                'total_monthly_installments': sum([float(loan.monthly_installment) for loan in application.financial_data.existing_loans]),
                'bank_transaction_volume': float(application.financial_data.bank_transaction_volume_1y or 0),
                
                # Score components
                'data_points_score': score.data_points_score,
                'credit_ratios_score': float(score.credit_ratios_score),
                'borrower_attributes_score': score.borrower_attributes_score,
                'final_score': float(score.total_points),
                'grade': score.grade,
                'risk_level': score.risk_level,
                
                # Target variable (for training)
                'default_status': 1 if score.grade == 'R' else 0,  # Simplified target
            }
            
            # Add psychometric data if available
            if score.psychometric_result:
                record.update({
                    'psychometric_total': score.psychometric_result.total_score,
                    'time_discipline': score.psychometric_result.time_discipline_score,
                    'impulse_planning': score.psychometric_result.impulse_planning_score,
                    'honesty_responsibility': score.psychometric_result.honesty_responsibility_score,
                    'resilience': score.psychometric_result.resilience_score,
                    'future_orientation': score.psychometric_result.future_orientation_score,
                })
            
            records.append(record)
        
        return pd.DataFrame(records)
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer additional features"""
        # Debt-to-income ratio
        df['debt_to_income_ratio'] = df['total_monthly_installments'] / (df['monthly_income'] + 1)
        
        # Sales to expense ratio
        df['sales_to_expense_ratio'] = df['last_month_sales'] / (df['last_month_sales'] * df['total_expense_ratio'] + 1)
        
        # Business maturity score
        df['business_maturity'] = np.sqrt(df['years_of_operation'] * df['years_of_residency'])
        
        # Financial stability score
        df['financial_stability'] = (df['bank_transaction_volume'] / 1000000) + (df['inventory_value'] / 1000000)
        
        # Risk concentration (existing loans)
        df['loan_concentration'] = np.where(df['existing_loan_count'] > 3, 1, 0)
        
        return df
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values"""
        # Fill numerical columns with median
        numerical_columns = df.select_dtypes(include=[np.number]).columns
        for col in numerical_columns:
            df[col] = df[col].fillna(df[col].median())
        
        # Fill categorical columns with mode
        categorical_columns = df.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            df[col] = df[col].fillna(df[col].mode().iloc[0] if not df[col].mode().empty else 'unknown')
        
        return df
    
    def _encode_categorical_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Encode categorical features"""
        categorical_columns = ['residency_status', 'guarantor_category', 'business_type', 
                             'seller_type', 'grade', 'risk_level']
        
        for col in categorical_columns:
            if col in df.columns:
                if fit:
                    # Fit and transform
                    if col not in self.encoders:
                        self.encoders[col] = LabelEncoder()
                    df[col] = self.encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Transform only (using fitted encoder)
                    if col in self.encoders:
                        # Handle unseen categories
                        df[col] = df[col].astype(str)
                        mask = df[col].isin(self.encoders[col].classes_)
                        df.loc[~mask, col] = self.encoders[col].classes_[0]  # Use first class for unseen
                        df[col] = self.encoders[col].transform(df[col])
        
        return df
    
    def _scale_numerical_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Scale numerical features"""
        # Exclude target column and already encoded categorical columns
        exclude_columns = [self.target_column, 'grade', 'risk_level']
        numerical_columns = [col for col in df.select_dtypes(include=[np.number]).columns 
                           if col not in exclude_columns]
        
        if fit:
            # Fit and transform
            self.scalers['standard'] = StandardScaler()
            df[numerical_columns] = self.scalers['standard'].fit_transform(df[numerical_columns])
        else:
            # Transform only
            if 'standard' in self.scalers:
                # Ensure all columns are present
                for col in numerical_columns:
                    if col not in df.columns:
                        df[col] = 0
                df[numerical_columns] = self.scalers['standard'].transform(df[numerical_columns])
        
        return df
    
    def _calculate_expense_ratio(self, business_data) -> float:
        """Calculate expense ratio"""
        if business_data.last_month_sales and business_data.last_month_sales > 0:
            total_expense = business_data.total_expense_last_month or 0
            return float(total_expense) / float(business_data.last_month_sales)
        return 0.5  # Default expense ratio