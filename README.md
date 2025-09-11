# README.md
# Credit Scoring System

A comprehensive AI-based credit scoring system built with Django, React, and MongoDB. This system evaluates borrower creditworthiness using Data Points, Credit Ratios, and Borrower Attributes (5C Model).

## Features

- **Comprehensive Credit Scoring**: Multi-component evaluation system
- **AI-Powered Risk Assessment**: Machine learning integration for default prediction
- **Real-time Dashboard**: Interactive analytics and monitoring
- **Psychometric Testing**: Behavioral assessment module
- **Automated Report Generation**: PDF and Excel export capabilities
- **RESTful API**: Complete API for integration
- **Role-based Access**: Admin, analyst, and viewer roles
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Backend**: Django, Django REST Framework, MongoDB
- **Frontend**: React, TypeScript, RTK Query, Tailwind CSS
- **Database**: MongoDB
- **Caching**: Redis
- **Queue**: Celery
- **Charts**: Recharts
- **Deployment**: Docker, Nginx

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd credit-scoring-system
   ```

2. **Environment Setup**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend  
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## Development Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

The system provides comprehensive REST APIs:

- `GET /api/scoring/applications/` - List applications
- `POST /api/scoring/applications/` - Create application
- `POST /api/scoring/calculate/` - Calculate credit score
- `GET /api/scoring/results/{id}/` - Get scoring results
- `GET /api/reports/score-breakdown/{id}/` - Generate reports
- `GET /api/dashboard/stats/` - Dashboard statistics

## Credit Scoring Algorithm

The system uses a weighted scoring model:

1. **Data Points Score** (30% weight) - 100 points
   - Financial Discipline (35 points)
   - Business Performance (45 points)  
   - Compliance (20 points)

2. **Credit Ratios Score** (20% weight) - 100 points
   - Profitability, Debt Burden, Leverage, Interest/Income, Liquidity, Current ratios

3. **Borrower Attributes** (48% weight) - 100 points
   - Character, Capital, Capacity, Collateral, Conditions (5C Model)

4. **Psychometric Score** (2% weight) - Adjustment points (-5 to +5)

**Final Score** = (DP×30 + CR×20 + BA×48 + PS×2) / 100

## Grading System

- **Grade A** (≥65): Premium terms, one slab up
- **Grade B** (51-64): Standard terms, same slab  
- **Grade C** (35-50): Restricted terms, one slab down
- **Grade R** (<35): Rejected

## Deployment

### Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# SSL Setup (using Let's Encrypt)
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot/ -d yourdomain.com
```

### Environment Variables

Key environment variables to configure:

```bash
# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ENVIRONMENT=production
ALLOWED_HOST=yourdomain.com

# Database
MONGODB_URI=mongodb://username:password@localhost:27017/credit_scoring
MONGODB_NAME=credit_scoring

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Model Configuration
DPW=30  # Data Points Weight
CRW=20  # Credit Ratios Weight  
CAW=48  # 5C Attributes Weight
PSW=2   # Psychometric Score Weight

# Grade Thresholds
MIN_A=65
MIN_B=51
MIN_C=35

# AI/ML
ML_MODEL_PATH=./ai_models/models/saved_models/
ENABLE_AI_PREDICTIONS=True

# External Services
PSYCHOMETRIC_SERVICE_URL=http://localhost:5001/
RISK_ASSESSMENT_SERVICE_URL=http://localhost:5002/

# AWS (for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Project Structure

```
credit-scoring-system/
├── backend/
│   ├── credit_scoring/           # Django project
│   ├── apps/                     # Django apps
│   │   ├── authentication/       # User management
│   │   ├── credit_scoring/       # Core scoring logic
│   │   ├── reports/              # Report generation
│   │   ├── analytics/            # Analytics & insights
│   │   └── common/               # Shared utilities
│   ├── ai_models/                # ML models
│   │   ├── training/             # Model training
│   │   ├── inference/            # Prediction logic
│   │   └── models/               # Saved models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── store/                # Redux store
│   │   ├── hooks/                # Custom hooks
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml            # Development setup
├── docker-compose.prod.yml       # Production setup
└── README.md
```

## Features Deep Dive

### 1. Credit Application Processing
- Multi-step form with validation
- Real-time field validation
- Progress tracking
- Auto-save functionality
- File upload support

### 2. Scoring Engine
- Configurable weights and thresholds
- Real-time score calculation
- Component-wise breakdown
- Risk flag identification
- Historical score tracking

### 3. Dashboard & Analytics
- Key performance metrics
- Interactive charts and graphs
- Trend analysis
- Risk distribution
- Performance monitoring
- Export capabilities

### 4. Report Generation
- Score breakdown reports
- Risk assessment reports
- Comparative analysis
- PDF/Excel export
- Automated email delivery
- Template customization

### 5. User Management
- Role-based permissions
- JWT authentication
- Session management
- Activity logging
- Password policies

## API Integration

### Authentication
```javascript
// Login
POST /api/auth/login/
{
  "username": "user@example.com",
  "password": "password"
}

// Response
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "user@example.com",
    "role": "analyst"
  }
}
```

### Score Calculation
```javascript
// Calculate score
POST /api/scoring/calculate/
{
  "application_id": "app-123",
  "psychometric_responses": {
    "td_1": {"selected_option": 0},
    "ip_1": {"selected_option": 1}
  }
}

// Response
{
  "success": true,
  "data": {
    "total_points": 67.5,
    "grade": "B",
    "risk_level": "medium",
    "max_loan_amount": 500000,
    "recommendations": [...]
  }
}
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Tests
```bash
# Run full test suite
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Performance Optimization

### Backend Optimization
- MongoDB indexing on frequently queried fields
- Redis caching for computed scores
- Celery for background tasks
- Query optimization with aggregation pipelines
- API response compression

### Frontend Optimization
- Code splitting with React.lazy()
- RTK Query caching
- Virtualized lists for large datasets
- Image optimization
- Bundle size optimization

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting
- Secure HTTP headers
- Data encryption at rest

## Monitoring & Logging

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- User activity logging
- API usage analytics
- System health checks

### Log Management
```python
# Structured logging
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'credit_scoring.log',
        },
    },
    'loggers': {
        'apps.credit_scoring': {
            'handlers': ['file'],
            'level': 'DEBUG',
        },
    },
}
```

## Backup & Recovery

### Database Backup
```bash
# MongoDB backup
docker exec credit_scoring_mongodb mongodump --out /backup

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec credit_scoring_mongodb mongodump --out /backup/backup_$DATE
```

### Application Backup
```bash
# Full application backup
tar -czf backup_$(date +%Y%m%d).tar.gz \
  --exclude='*/node_modules' \
  --exclude='*/__pycache__' \
  --exclude='*/logs' \
  credit-scoring-system/
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple application instances
- Database replication
- CDN for static assets
- Microservices architecture

### Vertical Scaling
- Resource monitoring
- Performance profiling
- Database optimization
- Caching strategies
- Background job optimization

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript for frontend
- Write tests for new features
- Update documentation
- Use conventional commits

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB status
docker logs credit_scoring_mongodb

# Reset MongoDB data
docker-compose down -v
docker-compose up -d mongodb
```

**Redis Connection Error**  
```bash
# Check Redis status
docker logs credit_scoring_redis

# Test Redis connection
docker exec -it credit_scoring_redis redis-cli ping
```

**Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --clean
```

**Backend Migration Issues**
```bash
# Since we use MongoDB, no traditional migrations
# But you can reset collections if needed
python manage.py shell
>>> from mongoengine import connect
>>> connect('credit_scoring')
>>> # Drop and recreate collections as needed
```

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation
- Contact the development team

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Credit scoring algorithms based on industry standards
- UI components inspired by modern design systems  
- MongoDB ODM powered by MongoEngine
- Charts powered by Recharts
- State management by Redux Toolkit