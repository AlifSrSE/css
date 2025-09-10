# apps/credit_scoring/services/psychometric_analyzer.py
from typing import Dict, List, Any
from datetime import datetime
import logging

from apps.credit_scoring.models import PsychometricResult

logger = logging.getLogger(__name__)

class PsychometricAnalyzer:
    """
    Psychometric Testing Module for behavioral assessment
    5 key behavioral dimensions:
    - Time Discipline
    - Impulse vs Planning
    - Honesty/Responsibility  
    - Resilience
    - Future Orientation
    """
    
    def __init__(self):
        self.questions = self._load_question_bank()
        self.scoring_bands = {
            'high_repayment': {'min': 90, 'max': 100, 'adjustment': 5},
            'moderate': {'min': 80, 'max': 89, 'adjustment': 2},
            'average': {'min': 60, 'max': 79, 'adjustment': 0},
            'weak': {'min': 40, 'max': 59, 'adjustment': -2},
            'high_risk': {'min': 0, 'max': 39, 'adjustment': -5}
        }
    
    def analyze(self, responses: Dict[str, Any]) -> PsychometricResult:
        """
        Analyze psychometric test responses and return behavioral profile
        """
        try:
            start_time = responses.get('start_time')
            end_time = responses.get('end_time', datetime.utcnow().isoformat())
            test_duration = self._calculate_duration(start_time, end_time)
            
            # Score each behavioral dimension
            time_discipline = self._score_time_discipline(responses)
            impulse_planning = self._score_impulse_planning(responses)
            honesty_responsibility = self._score_honesty_responsibility(responses)
            resilience = self._score_resilience(responses)
            future_orientation = self._score_future_orientation(responses)
            
            # Calculate total score
            total_score = (time_discipline + impulse_planning + honesty_responsibility + 
                          resilience + future_orientation)
            
            # Determine adjustment points
            adjustment_points = self._get_adjustment_points(total_score)
            
            return PsychometricResult(
                question_responses=responses,
                time_discipline_score=time_discipline,
                impulse_planning_score=impulse_planning,
                honesty_responsibility_score=honesty_responsibility,
                resilience_score=resilience,
                future_orientation_score=future_orientation,
                total_score=total_score,
                adjustment_points=adjustment_points,
                test_duration_minutes=test_duration
            )
            
        except Exception as e:
            logger.error(f"Error analyzing psychometric responses: {str(e)}")
            raise
    
    def _load_question_bank(self) -> Dict[str, List[Dict]]:
        """Load psychometric question bank"""
        return {
            'time_discipline': [
                {
                    'id': 'td_1',
                    'question': 'How often do you arrive on time for meetings or appointments?',
                    'options': [
                        {'text': 'Always on time or early', 'score': 20},
                        {'text': 'Usually on time (within 5 minutes)', 'score': 15},
                        {'text': 'Sometimes late (5-15 minutes)', 'score': 10},
                        {'text': 'Often late (15+ minutes)', 'score': 5},
                        {'text': 'Rarely on time', 'score': 0}
                    ]
                }
            ],
            'impulse_planning': [
                {
                    'id': 'ip_1',
                    'question': 'If you received an unexpected 50,000 BDT, what would you most likely do?',
                    'options': [
                        {'text': 'Save it for future business needs', 'score': 20},
                        {'text': 'Invest in business expansion', 'score': 18},
                        {'text': 'Pay off existing debts', 'score': 16},
                        {'text': 'Buy something I\'ve wanted for a while', 'score': 8},
                        {'text': 'Spend it on immediate family needs', 'score': 12},
                        {'text': 'Spend it quickly on things I want', 'score': 2}
                    ]
                }
            ],
            'honesty_responsibility': [
                {
                    'id': 'hr_1',
                    'question': 'If you accidentally damaged something you borrowed from a friend, what would you do?',
                    'options': [
                        {'text': 'Immediately tell them and offer to replace it', 'score': 20},
                        {'text': 'Tell them and ask how to make it right', 'score': 18},
                        {'text': 'Tell them but explain why it wasn\'t entirely my fault', 'score': 12},
                        {'text': 'Return it and hope they don\'t notice', 'score': 5},
                        {'text': 'Avoid the situation and not return it immediately', 'score': 0}
                    ]
                }
            ],
            'resilience': [
                {
                    'id': 'r_1',
                    'question': 'When facing an unexpected large expense (like medical emergency), how do you typically handle it?',
                    'options': [
                        {'text': 'Use emergency savings I\'ve set aside', 'score': 20},
                        {'text': 'Temporarily reduce other expenses to manage', 'score': 18},
                        {'text': 'Borrow from family or friends', 'score': 12},
                        {'text': 'Take a loan or use credit', 'score': 8},
                        {'text': 'Panic and don\'t know what to do', 'score': 2}
                    ]
                }
            ],
            'future_orientation': [
                {
                    'id': 'fo_1',
                    'question': 'What is your primary goal for your business in the next 6 months?',
                    'options': [
                        {'text': 'Expand to new locations or products', 'score': 20},
                        {'text': 'Increase sales by a specific percentage', 'score': 18},
                        {'text': 'Improve business processes and efficiency', 'score': 16},
                        {'text': 'Maintain current operations steadily', 'score': 12},
                        {'text': 'Just survive day-to-day challenges', 'score': 5},
                        {'text': 'I don\'t think much about the future', 'score': 0}
                    ]
                }
            ]
        }
    
    def _score_time_discipline(self, responses: Dict[str, Any]) -> int:
        """Score time discipline based on meeting punctuality"""
        question_id = 'td_1'
        response = responses.get(question_id, {})
        selected_option = response.get('selected_option', 0)
        
        questions = self.questions['time_discipline']
        for question in questions:
            if question['id'] == question_id:
                if selected_option < len(question['options']):
                    return question['options'][selected_option]['score']
        
        return 10  # Default moderate score
    
    def _score_impulse_planning(self, responses: Dict[str, Any]) -> int:
        """Score impulse control vs planning behavior"""
        question_id = 'ip_1'
        response = responses.get(question_id, {})
        selected_option = response.get('selected_option', 0)
        
        questions = self.questions['impulse_planning']
        for question in questions:
            if question['id'] == question_id:
                if selected_option < len(question['options']):
                    return question['options'][selected_option]['score']
        
        return 10  # Default moderate score
    
    def _score_honesty_responsibility(self, responses: Dict[str, Any]) -> int:
        """Score honesty and responsibility traits"""
        question_id = 'hr_1'
        response = responses.get(question_id, {})
        selected_option = response.get('selected_option', 0)
        
        questions = self.questions['honesty_responsibility']
        for question in questions:
            if question['id'] == question_id:
                if selected_option < len(question['options']):
                    return question['options'][selected_option]['score']
        
        return 10  # Default moderate score
    
    def _score_resilience(self, responses: Dict[str, Any]) -> int:
        """Score resilience and problem-solving capability"""
        question_id = 'r_1'
        response = responses.get(question_id, {})
        selected_option = response.get('selected_option', 0)
        
        questions = self.questions['resilience']
        for question in questions:
            if question['id'] == question_id:
                if selected_option < len(question['options']):
                    return question['options'][selected_option]['score']
        
        return 10  # Default moderate score
    
    def _score_future_orientation(self, responses: Dict[str, Any]) -> int:
        """Score future orientation and goal setting"""
        question_id = 'fo_1'
        response = responses.get(question_id, {})
        selected_option = response.get('selected_option', 0)
        
        questions = self.questions['future_orientation']
        for question in questions:
            if question['id'] == question_id:
                if selected_option < len(question['options']):
                    return question['options'][selected_option]['score']
        
        return 10  # Default moderate score
    
    def _get_adjustment_points(self, total_score: int) -> int:
        """Get final score adjustment points based on total psychometric score"""
        for band_name, band_data in self.scoring_bands.items():
            if band_data['min'] <= total_score <= band_data['max']:
                return band_data['adjustment']
        
        return 0  # Default no adjustment
    
    def _calculate_duration(self, start_time: str, end_time: str) -> float:
        """Calculate test duration in minutes"""
        try:
            if not start_time:
                return 12.0  # Default expected duration
            
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            duration = (end - start).total_seconds() / 60
            
            return round(duration, 2)
        except Exception:
            return 12.0  # Default if calculation fails
    
    def get_behavioral_profile(self, psychometric_result: PsychometricResult) -> Dict[str, Any]:
        """Generate comprehensive behavioral profile report"""
        profile = {
            'overall_score': psychometric_result.total_score,
            'adjustment_impact': psychometric_result.adjustment_points,
            'test_completion_time': psychometric_result.test_duration_minutes,
            'behavioral_strengths': [],
            'behavioral_concerns': [],
            'recommendations': [],
            'risk_indicators': []
        }
        
        # Analyze each dimension
        dimensions = {
            'Time Discipline': psychometric_result.time_discipline_score,
            'Impulse Control & Planning': psychometric_result.impulse_planning_score,
            'Honesty & Responsibility': psychometric_result.honesty_responsibility_score,
            'Resilience': psychometric_result.resilience_score,
            'Future Orientation': psychometric_result.future_orientation_score
        }
        
        for dimension, score in dimensions.items():
            if score >= 16:
                profile['behavioral_strengths'].append(f"Strong {dimension.lower()}")
            elif score <= 8:
                profile['behavioral_concerns'].append(f"Weak {dimension.lower()}")
                profile['risk_indicators'].append(f"Low {dimension.lower()} score: {score}/20")
        
        # Generate recommendations based on overall score
        if psychometric_result.total_score >= 90:
            profile['recommendations'].append("Excellent behavioral profile - suitable for premium terms")
        elif psychometric_result.total_score >= 80:
            profile['recommendations'].append("Good behavioral traits - standard monitoring sufficient")
        elif psychometric_result.total_score >= 60:
            profile['recommendations'].append("Average behavioral profile - regular monitoring recommended")
        elif psychometric_result.total_score >= 40:
            profile['recommendations'].append("Some behavioral concerns - enhanced monitoring and support needed")
        else:
            profile['recommendations'].append("Significant behavioral risks - consider rejection or very close monitoring")
        
        # Test completion time analysis
        if psychometric_result.test_duration_minutes < 5:
            profile['risk_indicators'].append("Test completed too quickly - may indicate rushed responses")
        elif psychometric_result.test_duration_minutes > 20:
            profile['risk_indicators'].append("Test took unusually long - may indicate difficulty or confusion")
        
        return profile
    
    def get_question_for_frontend(self, dimension: str, question_id: str = None) -> Dict[str, Any]:
        """Get formatted question for frontend display"""
        if dimension not in self.questions:
            raise ValueError(f"Invalid dimension: {dimension}")
        
        questions = self.questions[dimension]
        
        # Return first question if no specific ID provided
        if not question_id:
            question = questions[0] if questions else None
        else:
            question = next((q for q in questions if q['id'] == question_id), None)
        
        if not question:
            raise ValueError(f"Question not found: {question_id}")
        
        return {
            'id': question['id'],
            'dimension': dimension,
            'question': question['question'],
            'options': [{'id': i, 'text': opt['text']} for i, opt in enumerate(question['options'])],
            'max_score': max([opt['score'] for opt in question['options']])
        }
    
    def get_all_questions_for_test(self) -> List[Dict[str, Any]]:
        """Get all questions formatted for frontend test interface"""
        all_questions = []
        
        for dimension, questions in self.questions.items():
            for question in questions:
                formatted_question = self.get_question_for_frontend(dimension, question['id'])
                all_questions.append(formatted_question)
        
        return all_questions
    
    def validate_responses(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Validate psychometric test responses"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': []
        }
        
        required_questions = ['td_1', 'ip_1', 'hr_1', 'r_1', 'fo_1']
        
        # Check for missing responses
        for question_id in required_questions:
            if question_id not in responses:
                validation_result['is_valid'] = False
                validation_result['errors'].append(f"Missing response for question: {question_id}")
        
        # Check response format
        for question_id, response in responses.items():
            if question_id in required_questions:
                if not isinstance(response, dict) or 'selected_option' not in response:
                    validation_result['is_valid'] = False
                    validation_result['errors'].append(f"Invalid response format for question: {question_id}")
        
        # Check test timing
        start_time = responses.get('start_time')
        end_time = responses.get('end_time')
        
        if start_time and end_time:
            duration = self._calculate_duration(start_time, end_time)
            if duration < 2:
                validation_result['warnings'].append("Test completed very quickly - responses may be rushed")
            elif duration > 30:
                validation_result['warnings'].append("Test took unusually long - may affect reliability")
        
        return validation_result