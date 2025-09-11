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

    return list(set(keywords))
def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode('utf-8'))
    return f"{salt}${hash_obj.hexdigest()}"
def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verify provided password against stored hash"""
    try:
        salt, hash_val = stored_password.split('$')
        hash_obj = hashlib.sha256((salt + provided_password).encode('utf-8'))
        return hash_obj.hexdigest() == hash_val
    except ValueError:
        return False
def generate_password_reset_token() -> str:
    """Generate a secure password reset token"""
    return secrets.token_urlsafe(32)
def is_token_expired(expiry_time: datetime) -> bool:
    """Check if a token is expired"""
    return datetime.utcnow() > expiry_time
def set_token_expiry(minutes: int = 30) -> datetime:
    """Set token expiry time"""
    return datetime.utcnow() + timedelta(minutes=minutes)
def log_event(event_type: str, message: str, user_id: Optional[str] = None) -> None:
    """Log events for auditing"""
    log_message = f"{datetime.utcnow().isoformat()} | {event_type} | {message}"
    if user_id:
        log_message += f" | User ID: {user_id}"
    logger.info(log_message)
    'admin': ['add_user', 'delete_user', 'view_reports', 'configure_system'],
def user_has_permission(user_role: str, permission: str) -> bool:
    """Check if user has specific permission based on role"""
    role_permissions = {
        'admin': ['add_user', 'delete_user', 'view_reports', 'configure_system'],
        'manager': ['view_reports', 'approve_applications'],
        'analyst': ['view_reports', 'create_applications'],
        'viewer': ['view_reports'],
    }
    return permission in role_permissions.get(user_role, [])
def paginate_queryset(queryset: List[Any], page: int, page_size: int) -> Dict[str, Any]:
    """Paginate a list-based queryset"""
    total_items = len(queryset)
    total_pages = (total_items + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = queryset[start:end]
    
    return {
        'page': page,
        'page_size': page_size,
        'total_items': total_items,
        'total_pages': total_pages,
        'items': paginated_items
    }
def sort_queryset(queryset: List[Dict[str, Any]], sort_by: str, descending: bool = False) -> List[Dict[str, Any]]:
    """Sort a list-based queryset by a specific field"""
    try:
        return sorted(queryset, key=lambda x: x.get(sort_by), reverse=descending)
    except KeyError:
        return queryset
def filter_queryset(queryset: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Filter a list-based queryset based on provided filters"""
    def matches_filters(item: Dict[str, Any]) -> bool:
        for key, value in filters.items():
            if item.get(key) != value:
                return False
        return True
    
    return [item for item in queryset if matches_filters(item)]
def transform_data(data: List[Dict[str, Any]], transformations: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Transform data based on provided transformation rules"""
    transformed_data = []
    for item in data:
        new_item = item.copy()
        for key, func in transformations.items():
            if key in new_item:
                new_item[key] = func(new_item[key])
        transformed_data.append(new_item)
    return transformed_data
def generate_report(data: List[Dict[str, Any]], report_type: str) -> str:
    """Generate a simple text-based report"""
    report_lines = [f"Report Type: {report_type}", f"Generated At: {datetime.utcnow().isoformat()}", "-"*40]
    for item in data:
        line = ", ".join(f"{k}: {v}" for k, v in item.items())
        report_lines.append(line)
    return "\n".join(report_lines)
def export_to_csv(data: List[Dict[str, Any]], file_path: str) -> None:
    """Export data to a CSV file"""
    import csv
    if not data:
        return
    
    keys = data[0].keys()
    with open(file_path, 'w', newline='', encoding='utf-8') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(data)
def export_to_json(data: List[Dict[str, Any]], file_path: str) -> None:
    """Export data to a JSON file"""
    import json
    with open(file_path, 'w', encoding='utf-8') as output_file:
        json.dump(data, output_file, ensure_ascii=False, indent=4)
def export_to_excel(data: List[Dict[str, Any]], file_path: str) -> None:
    """Export data to an Excel file"""
    import pandas as pd
    if not data:
        return
    
    df = pd.DataFrame(data)
    df.to_excel(file_path, index=False)
def import_from_csv(file_path: str) -> List[Dict[str, Any]]:
    """Import data from a CSV file"""
    import csv
    with open(file_path, 'r', encoding='utf-8') as input_file:
        dict_reader = csv.DictReader(input_file)
        return list(dict_reader)
def import_from_json(file_path: str) -> List[Dict[str, Any]]:
    