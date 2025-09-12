import os
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ReportGenerator:
    """Main report generation class"""
    
    def __init__(self):
        self.report_types = {
            'score_breakdown': self._generate_score_breakdown,
            'risk_assessment': self._generate_risk_assessment,
            'comparative_analysis': self._generate_comparative_analysis,
            'portfolio_summary': self._generate_portfolio_summary
        }
    
    def generate_report(self, report_type: str, application_ids: List[str], 
                       format: str = 'pdf', **kwargs) -> Dict[str, Any]:
        """Generate report based on type and parameters"""
        try:
            start_time = datetime.utcnow()
            
            if report_type not in self.report_types:
                raise ValueError(f"Unsupported report type: {report_type}")
            
            # Generate unique report ID
            report_id = f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8].upper()}"
            
            # Get applications and scores
            applications_data = self._get_applications_data(application_ids)
            
            if not applications_data:
                raise ValueError("No valid applications found")
            
            # Generate report data
            generator_func = self.report_types[report_type]
            report_data = generator_func(applications_data, **kwargs)
            
            # Generate file based on format
            file_info = self._generate_file(report_data, report_type, format, report_id)
            
            generation_duration = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                'report_id': report_id,
                'report_type': report_type,
                'format': format,
                'status': 'completed',
                'report_data': report_data,
                'file_path': file_info['file_path'],
                'download_url': file_info['download_url'],
                'file_size': file_info['file_size'],
                'generation_duration': generation_duration,
                'generated_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(days=7)
            }
            
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            raise
    
    def _get_applications_data(self, application_ids: List[str]) -> List[Dict]:
        """Get application and score data"""
        from apps.credit_scoring.models import CreditApplication, CreditScore
        
        applications_data = []
        
        for app_id in application_ids:
            try:
                application = CreditApplication.objects(application_id=app_id).first()
                if not application:
                    logger.warning(f"Application {app_id} not found")
                    continue
                
                score = CreditScore.objects(application=application).first()
                if not score:
                    logger.warning(f"Score not found for application {app_id}")
                    continue
                
                applications_data.append({
                    'application': application,
                    'score': score
                })
                
            except Exception as e:
                logger.error(f"Error fetching data for application {app_id}: {str(e)}")
                continue
        
        return applications_data
    
    def _generate_score_breakdown(self, applications_data: List[Dict], **kwargs) -> Dict:
        """Generate score breakdown report"""
        report_data = {
            'title': 'Credit Score Breakdown Report',
            'generated_at': datetime.utcnow().isoformat(),
            'total_applications': len(applications_data),
            'applications': []
        }
        
        for data in applications_data:
            application = data['application']
            score = data['score']
            
            app_report = {
                'application_id': application.application_id,
                'borrower_name': application.borrower_info.full_name,
                'business_name': application.business_data.business_name,
                'business_type': application.business_data.business_type,
                'loan_amount_requested': float(application.loan_amount_requested or 0),
                'score_details': {
                    'final_score': float(score.total_points),
                    'grade': score.grade,
                    'loan_slab_adjustment': score.loan_slab_adjustment,
                    'risk_level': score.risk_level,
                    'default_probability': float(score.default_probability),
                    'max_loan_amount': float(score.max_loan_amount),
                    'component_scores': {
                        'data_points': {
                            'score': score.data_points_score,
                            'percentage': (score.data_points_score / 100) * 30,  # 30% weight
                            'breakdown': score.data_points_breakdown
                        },
                        'credit_ratios': {
                            'score': float(score.credit_ratios_score),
                            'percentage': float(score.credit_ratios_score / 100) * 20,  # 20% weight
                            'ratios': [
                                {
                                    'name': ratio.ratio_name,
                                    'value': float(ratio.ratio_value),
                                    'score': ratio.score,
                                    'band': ratio.band,
                                    'threshold_met': ratio.threshold_met
                                }
                                for ratio in score.credit_ratios_breakdown
                            ]
                        },
                        'borrower_attributes': {
                            'score': score.borrower_attributes_score,
                            'percentage': (score.borrower_attributes_score / 100) * 48,  # 48% weight
                            'breakdown': score.borrower_attributes_breakdown
                        }
                    }
                },
                'risk_assessment': {
                    'level': score.risk_level,
                    'probability': float(score.default_probability),
                    'red_flags': [
                        {
                            'type': flag.flag_type,
                            'name': flag.flag_name,
                            'description': flag.description,
                            'severity': flag.severity,
                            'impact': flag.impact
                        }
                        for flag in score.red_flags
                    ]
                },
                'recommendations': score.recommendations,
                'calculated_at': score.calculated_at.isoformat()
            }
            
            # Add psychometric data if available
            if score.psychometric_result:
                app_report['score_details']['component_scores']['psychometric'] = {
                    'total_score': score.psychometric_result.total_score,
                    'adjustment_points': score.psychometric_result.adjustment_points,
                    'dimensions': {
                        'time_discipline': score.psychometric_result.time_discipline_score,
                        'impulse_planning': score.psychometric_result.impulse_planning_score,
                        'honesty_responsibility': score.psychometric_result.honesty_responsibility_score,
                        'resilience': score.psychometric_result.resilience_score,
                        'future_orientation': score.psychometric_result.future_orientation_score
                    },
                    'test_duration': score.psychometric_result.test_duration_minutes
                }
            
            report_data['applications'].append(app_report)
        
        # Add summary statistics
        if applications_data:
            scores = [float(data['score'].total_points) for data in applications_data]
            grade_counts = {}
            risk_counts = {}
            
            for data in applications_data:
                grade = data['score'].grade
                risk = data['score'].risk_level
                grade_counts[grade] = grade_counts.get(grade, 0) + 1
                risk_counts[risk] = risk_counts.get(risk, 0) + 1
            
            report_data['summary'] = {
                'average_score': sum(scores) / len(scores),
                'highest_score': max(scores),
                'lowest_score': min(scores),
                'grade_distribution': grade_counts,
                'risk_distribution': risk_counts,
                'total_loan_amount_requested': sum([
                    float(data['application'].loan_amount_requested or 0) 
                    for data in applications_data
                ]),
                'total_max_loan_amount': sum([
                    float(data['score'].max_loan_amount) 
                    for data in applications_data
                ])
            }
        
        return report_data
    
    def _generate_risk_assessment(self, applications_data: List[Dict], **kwargs) -> Dict:
        """Generate risk assessment report"""
        report_data = {
            'title': 'Risk Assessment Report',
            'generated_at': datetime.utcnow().isoformat(),
            'total_applications': len(applications_data),
            'risk_analysis': []
        }
        
        all_red_flags = []
        risk_levels = []
        default_probabilities = []
        
        for data in applications_data:
            application = data['application']
            score = data['score']
            
            risk_analysis = {
                'application_id': application.application_id,
                'borrower_name': application.borrower_info.full_name,
                'business_name': application.business_data.business_name,
                'risk_level': score.risk_level,
                'default_probability': float(score.default_probability),
                'grade': score.grade,
                'red_flags': [
                    {
                        'type': flag.flag_type,
                        'name': flag.flag_name,
                        'description': flag.description,
                        'severity': flag.severity,
                        'impact': flag.impact
                    }
                    for flag in score.red_flags
                ],
                'risk_factors': self._identify_risk_factors(application, score),
                'mitigation_strategies': self._generate_mitigation_strategies(score),
                'monitoring_recommendations': self._generate_monitoring_recommendations(score)
            }
            
            report_data['risk_analysis'].append(risk_analysis)
            
            # Collect data for summary
            all_red_flags.extend(score.red_flags)
            risk_levels.append(score.risk_level)
            default_probabilities.append(float(score.default_probability))
        
        # Generate risk summary
        report_data['risk_summary'] = self._generate_risk_summary(
            risk_levels, default_probabilities, all_red_flags
        )
        
        return report_data
    
    def _generate_comparative_analysis(self, applications_data: List[Dict], **kwargs) -> Dict:
        """Generate comparative analysis report"""
        report_data = {
            'title': 'Comparative Analysis Report',
            'generated_at': datetime.utcnow().isoformat(),
            'total_applications': len(applications_data),
            'comparisons': []
        }
        
        # Calculate industry benchmarks and peer comparisons
        business_types = {}
        for data in applications_data:
            business_type = data['application'].business_data.business_type
            if business_type not in business_types:
                business_types[business_type] = []
            business_types[business_type].append(data)
        
        for data in applications_data:
            application = data['application']
            score = data['score']
            business_type = application.business_data.business_type
            
            # Get peers in same business type
            peers = business_types.get(business_type, [])
            peer_scores = [float(p['score'].total_points) for p in peers if p != data]
            
            comparison = {
                'application_id': application.application_id,
                'borrower_name': application.borrower_info.full_name,
                'business_name': application.business_data.business_name,
                'business_type': business_type,
                'score': float(score.total_points),
                'grade': score.grade,
                'peer_comparison': {
                    'business_type': business_type,
                    'peer_count': len(peer_scores),
                    'peer_average': sum(peer_scores) / len(peer_scores) if peer_scores else 0,
                    'percentile_ranking': self._calculate_percentile(float(score.total_points), peer_scores),
                    'above_average': float(score.total_points) > (sum(peer_scores) / len(peer_scores)) if peer_scores else True
                },
                'component_comparison': {
                    'data_points': {
                        'score': score.data_points_score,
                        'peer_average': self._get_peer_average([p['score'].data_points_score for p in peers if p != data])
                    },
                    'credit_ratios': {
                        'score': float(score.credit_ratios_score),
                        'peer_average': self._get_peer_average([float(p['score'].credit_ratios_score) for p in peers if p != data])
                    },
                    'borrower_attributes': {
                        'score': score.borrower_attributes_score,
                        'peer_average': self._get_peer_average([p['score'].borrower_attributes_score for p in peers if p != data])
                    }
                }
            }
            
            report_data['comparisons'].append(comparison)
        
        # Generate industry insights
        report_data['industry_insights'] = self._generate_industry_insights(business_types)
        
        return report_data
    
    def _generate_portfolio_summary(self, applications_data: List[Dict], **kwargs) -> Dict:
        """Generate portfolio summary report"""
        report_data = {
            'title': 'Portfolio Summary Report',
            'generated_at': datetime.utcnow().isoformat(),
            'total_applications': len(applications_data),
            'portfolio_overview': {}
        }
        
        if not applications_data:
            return report_data
        
        # Calculate portfolio metrics
        scores = [float(data['score'].total_points) for data in applications_data]
        grades = [data['score'].grade for data in applications_data]
        risk_levels = [data['score'].risk_level for data in applications_data]
        loan_amounts = [float(data['application'].loan_amount_requested or 0) for data in applications_data]
        max_loan_amounts = [float(data['score'].max_loan_amount) for data in applications_data]
        
        # Grade distribution
        grade_dist = {}
        for grade in grades:
            grade_dist[grade] = grade_dist.get(grade, 0) + 1
        
        # Risk distribution
        risk_dist = {}
        for risk in risk_levels:
            risk_dist[risk] = risk_dist.get(risk, 0) + 1
        
        # Business type distribution
        business_types = {}
        for data in applications_data:
            btype = data['application'].business_data.business_type
            business_types[btype] = business_types.get(btype, 0) + 1
        
        report_data['portfolio_overview'] = {
            'total_applications': len(applications_data),
            'average_score': sum(scores) / len(scores),
            'score_range': {
                'min': min(scores),
                'max': max(scores),
                'std_dev': self._calculate_std_dev(scores)
            },
            'grade_distribution': grade_dist,
            'risk_distribution': risk_dist,
            'business_type_distribution': business_types,
            'loan_amounts': {
                'total_requested': sum(loan_amounts),
                'total_approved': sum(max_loan_amounts),
                'average_requested': sum(loan_amounts) / len(loan_amounts),
                'average_approved': sum(max_loan_amounts) / len(max_loan_amounts),
                'approval_ratio': sum(max_loan_amounts) / sum(loan_amounts) if sum(loan_amounts) > 0 else 0
            },
            'quality_metrics': {
                'approval_rate': len([g for g in grades if g in ['A', 'B', 'C']]) / len(grades) * 100,
                'high_grade_rate': len([g for g in grades if g in ['A', 'B']]) / len(grades) * 100,
                'low_risk_rate': len([r for r in risk_levels if r == 'low']) / len(risk_levels) * 100,
                'average_default_probability': sum([float(data['score'].default_probability) for data in applications_data]) / len(applications_data) * 100
            }
        }
        
        # Add trend analysis if dates are available
        report_data['trends'] = self._analyze_portfolio_trends(applications_data)
        
        return report_data
    
    def _generate_file(self, report_data: Dict, report_type: str, format: str, report_id: str) -> Dict:
        """Generate report file in specified format"""
        try:
            # Create reports directory if not exists
            reports_dir = 'media/reports'
            os.makedirs(reports_dir, exist_ok=True)
            
            filename = f"{report_id}.{format.lower()}"
            file_path = os.path.join(reports_dir, filename)
            
            if format.lower() == 'json':
                import json
                with open(file_path, 'w') as f:
                    json.dump(report_data, f, indent=2, default=str)
            
            elif format.lower() == 'excel':
                self._generate_excel_file(report_data, file_path, report_type)
            
            elif format.lower() == 'pdf':
                self._generate_pdf_file(report_data, file_path, report_type)
            
            elif format.lower() == 'html':
                self._generate_html_file(report_data, file_path, report_type)
            
            else:
                raise ValueError(f"Unsupported format: {format}")
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Generate download URL (this would be your actual file serving URL)
            download_url = f"/api/reports/download/{report_id}/"
            
            return {
                'file_path': file_path,
                'download_url': download_url,
                'file_size': file_size
            }
            
        except Exception as e:
            logger.error(f"File generation failed: {str(e)}")
            raise
    
    def _generate_excel_file(self, report_data: Dict, file_path: str, report_type: str):
        """Generate Excel format report"""
        try:
            import openpyxl
            from openpyxl.styles import Font, Alignment, PatternFill
            
            workbook = openpyxl.Workbook()
            
            if report_type == 'score_breakdown':
                self._create_score_breakdown_excel(workbook, report_data)
            elif report_type == 'risk_assessment':
                self._create_risk_assessment_excel(workbook, report_data)
            elif report_type == 'portfolio_summary':
                self._create_portfolio_summary_excel(workbook, report_data)
            
            workbook.save(file_path)
            
        except ImportError:
            logger.error("openpyxl not installed - cannot generate Excel files")
            raise Exception("Excel generation not available")
    
    def _generate_pdf_file(self, report_data: Dict, file_path: str, report_type: str):
        """Generate PDF format report"""
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors
            
            doc = SimpleDocTemplate(file_path, pagesize=A4)
            story = []
            styles = getSampleStyleSheet()
            
            # Title
            title = Paragraph(report_data.get('title', 'Credit Scoring Report'), styles['Title'])
            story.append(title)
            story.append(Spacer(1, 0.2*inch))
            
            # Generated date
            date_para = Paragraph(f"Generated on: {report_data.get('generated_at', '')}", styles['Normal'])
            story.append(date_para)
            story.append(Spacer(1, 0.3*inch))
            
            if report_type == 'score_breakdown':
                self._create_score_breakdown_pdf(story, report_data, styles)
            elif report_type == 'risk_assessment':
                self._create_risk_assessment_pdf(story, report_data, styles)
            elif report_type == 'portfolio_summary':
                self._create_portfolio_summary_pdf(story, report_data, styles)
            
            doc.build(story)
            
        except ImportError:
            logger.error("reportlab not installed - cannot generate PDF files")
            # Fallback to simple text file
            with open(file_path.replace('.pdf', '.txt'), 'w') as f:
                f.write(str(report_data))
    
    def _generate_html_file(self, report_data: Dict, file_path: str, report_type: str):
        """Generate HTML format report"""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{report_data.get('title', 'Credit Scoring Report')}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .summary {{ background-color: #f5f5f5; padding: 15px; margin: 20px 0; }}
                table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .grade-a {{ background-color: #d4edda; }}
                .grade-b {{ background-color: #cce7ff; }}
                .grade-c {{ background-color: #fff3cd; }}
                .grade-r {{ background-color: #f8d7da; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{report_data.get('title', 'Credit Scoring Report')}</h1>
                <p>Generated on: {report_data.get('generated_at', '')}</p>
            </div>
        """
        
        if report_type == 'score_breakdown':
            html_content += self._create_score_breakdown_html(report_data)
        elif report_type == 'risk_assessment':
            html_content += self._create_risk_assessment_html(report_data)
        elif report_type == 'portfolio_summary':
            html_content += self._create_portfolio_summary_html(report_data)
        
        html_content += """
        </body>
        </html>
        """
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    # Helper methods for specific report formats
    def _create_score_breakdown_html(self, report_data: Dict) -> str:
        """Create HTML content for score breakdown report"""
        html = ""
        
        if 'summary' in report_data:
            summary = report_data['summary']
            html += f"""
            <div class="summary">
                <h2>Summary</h2>
                <p><strong>Total Applications:</strong> {report_data['total_applications']}</p>
                <p><strong>Average Score:</strong> {summary['average_score']:.2f}</p>
                <p><strong>Score Range:</strong> {summary['lowest_score']:.2f} - {summary['highest_score']:.2f}</p>
            </div>
            """
        
        html += "<h2>Application Details</h2>"
        html += """
        <table>
            <tr>
                <th>Application ID</th>
                <th>Borrower Name</th>
                <th>Business Name</th>
                <th>Final Score</th>
                <th>Grade</th>
                <th>Risk Level</th>
                <th>Max Loan Amount</th>
            </tr>
        """
        
        for app in report_data.get('applications', []):
            grade_class = f"grade-{app['score_details']['grade'].lower()}"
            html += f"""
            <tr class="{grade_class}">
                <td>{app['application_id']}</td>
                <td>{app['borrower_name']}</td>
                <td>{app['business_name']}</td>
                <td>{app['score_details']['final_score']:.2f}</td>
                <td>{app['score_details']['grade']}</td>
                <td>{app['risk_assessment']['level']}</td>
                <td>৳{app['score_details']['max_loan_amount']:,.2f}</td>
            </tr>
            """
        
        html += "</table>"
        return html
    
    # Utility methods
    def _identify_risk_factors(self, application, score) -> List[str]:
        """Identify key risk factors"""
        risk_factors = []
        
        # Check credit ratios
        for ratio in score.credit_ratios_breakdown:
            if ratio.band == 'red':
                risk_factors.append(f"Poor {ratio.ratio_name.replace('_', ' ')} ratio: {ratio.ratio_value:.2f}%")
        
        # Check business factors
        if application.business_data.years_of_operation < 2:
            risk_factors.append("New business (less than 2 years)")
        
        # Check financial factors
        if application.financial_data.existing_loans:
            total_debt = sum([loan.outstanding_loan for loan in application.financial_data.existing_loans])
            if total_debt > 1000000:  # 10 Lakh BDT
                risk_factors.append("High existing debt burden")
        
        return risk_factors
    
    def _generate_mitigation_strategies(self, score) -> List[str]:
        """Generate risk mitigation strategies"""
        strategies = []
        
        if score.grade == 'C':
            strategies.append("Require additional collateral")
            strategies.append("Implement monthly monitoring")
            strategies.append("Consider shorter loan tenure")
        
        if score.risk_level in ['high', 'very_high']:
            strategies.append("Enhanced due diligence required")
            strategies.append("Weekly payment monitoring")
            strategies.append("Business mentor assignment")
        
        for flag in score.red_flags:
            if flag.flag_type == 'hard':
                strategies.append(f"Address {flag.flag_name} before approval")
        
        return strategies
    
    def _generate_monitoring_recommendations(self, score) -> List[str]:
        """Generate monitoring recommendations"""
        recommendations = []
        
        if score.risk_level == 'low':
            recommendations.append("Quarterly review")
        elif score.risk_level == 'medium':
            recommendations.append("Monthly review")
        else:
            recommendations.append("Weekly review")
            recommendations.append("Real-time payment tracking")
        
        recommendations.append("Business performance monitoring")
        recommendations.append("Early warning system alerts")
        
        return recommendations
    
    def _generate_risk_summary(self, risk_levels, default_probabilities, red_flags) -> Dict:
        """Generate risk summary statistics"""
        risk_counts = {}
        for risk in risk_levels:
            risk_counts[risk] = risk_counts.get(risk, 0) + 1
        
        flag_counts = {}
        for flag in red_flags:
            flag_counts[flag.flag_type] = flag_counts.get(flag.flag_type, 0) + 1
        
        return {
            'risk_distribution': risk_counts,
            'average_default_probability': sum(default_probabilities) / len(default_probabilities) * 100,
            'high_risk_percentage': (risk_counts.get('high', 0) + risk_counts.get('very_high', 0)) / len(risk_levels) * 100,
            'red_flag_distribution': flag_counts,
            'total_red_flags': len(red_flags)
        }
    
    def _calculate_percentile(self, score, peer_scores) -> float:
        """Calculate percentile ranking"""
        if not peer_scores:
            return 50.0
        
        below_count = sum(1 for s in peer_scores if s < score)
        return (below_count / len(peer_scores)) * 100
    
    def _get_peer_average(self, scores) -> float:
        """Get average of peer scores"""
        return sum(scores) / len(scores) if scores else 0
    
    def _generate_industry_insights(self, business_types) -> Dict:
        """Generate industry-level insights"""
        insights = {}
        
        for business_type, data_list in business_types.items():
            scores = [float(d['score'].total_points) for d in data_list]
            grades = [d['score'].grade for d in data_list]
            
            grade_dist = {}
            for grade in grades:
                grade_dist[grade] = grade_dist.get(grade, 0) + 1
            
            insights[business_type] = {
                'total_applications': len(data_list),
                'average_score': sum(scores) / len(scores),
                'grade_distribution': grade_dist,
                'approval_rate': len([g for g in grades if g != 'R']) / len(grades) * 100
            }
        
        return insights
    
    def _analyze_portfolio_trends(self, applications_data) -> Dict:
        """Analyze portfolio trends over time"""
        # Group by month
        monthly_data = {}
        
        for data in applications_data:
            created_date = data['application'].created_at
            month_key = created_date.strftime('%Y-%m')
            
            if month_key not in monthly_data:
                monthly_data[month_key] = []
            monthly_data[month_key].append(data)
        
        trends = []
        for month, month_data in sorted(monthly_data.items()):
            scores = [float(d['score'].total_points) for d in month_data]
            grades = [d['score'].grade for d in month_data]
            
            trends.append({
                'month': month,
                'applications': len(month_data),
                'average_score': sum(scores) / len(scores),
                'approval_rate': len([g for g in grades if g != 'R']) / len(grades) * 100
            })
        
        return trends
    
    def _calculate_std_dev(self, numbers) -> float:
        """Calculate standard deviation"""
        if len(numbers) < 2:
            return 0
        
        mean = sum(numbers) / len(numbers)
        variance = sum((x - mean) ** 2 for x in numbers) / len(numbers)
        return variance ** 0.5