import re
import hashlib
import secrets
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

def generate_application_id(prefix: str = "APP") -> str:
    """Generate unique application ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = secrets.token_hex(3).upper()
    return f"{prefix}-{timestamp}-{random_suffix}"

def generate_score_id(prefix: str = "SCR") -> str:
    """Generate unique score ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = secrets.token_hex(3).upper()
    return f"{prefix}-{timestamp}-{random_suffix}"

def validate_phone_number(phone: str) -> bool:
    """Validate phone number format"""
    # Bangladesh phone number patterns
    patterns = [
        r'^(\+88)?01[3-9]\d{8}$',  # Mobile numbers
        r'^(\+88)?02\d{7,8}$',     # Dhaka landline
        r'^(\+88)?0[3-9]\d{8,9}$', # Other area codes
    ]
    
    return any(re.match(pattern, phone) for pattern in patterns)

def validate_national_id(nid: str) -> bool:
    """Validate Bangladesh National ID"""
    # Basic NID validation (10, 13, or 17 digits)
    if not re.match(r'^\d{10}$|^\d{13}$|^\d{17}$', nid):
        return False
    
    # Additional validation logic can be added here
    return True

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def clean_currency_input(amount: str) -> Decimal:
    """Clean and convert currency input to Decimal"""
    if not amount:
        return Decimal('0')
    
    # Remove currency symbols and formatting
    cleaned = re.sub(r'[৳$,\s]', '', str(amount))
    
    try:
        return Decimal(cleaned).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except:
        return Decimal('0')

def format_currency(amount: Decimal, currency: str = 'BDT') -> str:
    """Format currency for display"""
    if currency == 'BDT':
        return f"৳{amount:,.2f}"
    else:
        return f"{currency} {amount:,.2f}"

def calculate_percentage(value: Decimal, total: Decimal) -> Decimal:
    """Calculate percentage with proper handling of zero division"""
    if total == 0:
        return Decimal('0')
    
    return (value / total * 100).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def calculate_age(birth_date: datetime) -> int:
    """Calculate age from birth date"""
    today = datetime.now().date()
    if isinstance(birth_date, datetime):
        birth_date = birth_date.date()
    
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

def mask_sensitive_data(data: str, mask_char: str = '*', show_last: int = 4) -> str:
    """Mask sensitive data (phone, email, NID)"""
    if len(data) <= show_last:
        return mask_char * len(data)
    
    return mask_char * (len(data) - show_last) + data[-show_last:]

def sanitize_input(input_string: str) -> str:
    """Sanitize user input"""
    if not input_string:
        return ""
    
    # Remove potential harmful characters
    sanitized = re.sub(r'[<>"\';]', '', input_string)
    return sanitized.strip()

def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text for search indexing"""
    if not text:
        return []
    
    # Convert to lowercase and split on non-alphanumeric characters
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Remove common stop words
    stop_words = {'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    keywords = [word for word in words if word not in stop_words and len(word) > 2]
    
    return list(set(keywords))  # Remove duplicates

def calculate_business_days(start_date: datetime, end_date: datetime) -> int:
    """Calculate business days between two dates"""
    current = start_date
    business_days = 0
    
    while current <= end_date:
        if current.weekday() < 5:  # Monday = 0, Friday = 4
            business_days += 1
        current += timedelta(days=1)
    
    return business_days

def get_financial_year(date: datetime = None) -> str:
    """Get financial year (July to June in Bangladesh)"""
    if date is None:
        date = datetime.now()
    
    if date.month >= 7:
        return f"FY{date.year}-{date.year + 1}"
    else:
        return f"FY{date.year - 1}-{date.year}"

def validate_business_type(business_type: str) -> bool:
    """Validate business type against allowed types"""
    allowed_types = [
        'grocery_shop', 'cosmetics', 'medicine', 'clothing_shop', 'wholesalers',
        'bakery', 'restaurant', 'library', 'hardware', 'sanitary', 'tea_stall',
        'motor_parts', 'sports_shop', 'tailor', 'shoe_seller', 'plastic_items',
        'salon', 'ladies_parlor', 'poultry_shop', 'vegetable_shop', 'garage',
        'super_shop', 'mobile_shop', 'accessories', 'servicing', 'wood_shop',
        'sub_contract_factory', 'gold_ornaments_seller', 'other'
    ]
    
    normalized_type = business_type.lower().replace(' ', '_').replace('-', '_')
    return normalized_type in allowed_types

def calculate_loan_emi(principal: Decimal, annual_rate: Decimal, tenure_months: int) -> Decimal:
    """Calculate EMI using reducing balance method"""
    if annual_rate == 0:
        return principal / tenure_months
    
    monthly_rate = annual_rate / (12 * 100)
    
    emi = principal * monthly_rate * (1 + monthly_rate) ** tenure_months / \
          ((1 + monthly_rate) ** tenure_months - 1)
    
    return emi.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def generate_hash(data: str, algorithm: str = 'sha256') -> str:
    """Generate hash for data integrity"""
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(data.encode('utf-8'))
    return hash_obj.hexdigest()

def paginate_queryset(queryset, page: int, page_size: int = 20):
    """Paginate queryset with metadata"""
    total_count = queryset.count()
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    items = queryset[start_index:end_index]
    
    total_pages = (total_count + page_size - 1) // page_size
    
    return {
        'items': items,
        'pagination': {
            'current_page': page,
            'page_size': page_size,
            'total_count': total_count,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_previous': page > 1,
            'next_page': page + 1 if page < total_pages else None,
            'previous_page': page - 1 if page > 1 else None,
        }
    }