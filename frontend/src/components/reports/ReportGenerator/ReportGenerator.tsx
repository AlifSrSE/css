import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Button } from '../../common/Forms/Button';
import { Input } from '../../common/Forms/Input';
import { Select } from '../../common/Forms/Select';
import { Modal } from '../../common/Layout/Modal';
import { useGenerateReportMutation } from '../../../store/api/reportsApi';
import { toast } from 'react-toastify';

interface ReportGeneratorProps {
  onReportGenerated?: (reportId: string) => void;
}

interface ReportConfig {
  report_type: 'score_breakdown' | 'risk_assessment' | 'comparative_analysis' | 'portfolio_summary';
  application_ids: string[];
  format: 'pdf' | 'excel' | 'html' | 'json';
  include_charts: boolean;
  include_recommendations: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  filters?: {
    grade?: string;
    risk_level?: string;
    business_type?: string;
  };
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onReportGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    report_type: 'score_breakdown',
    application_ids: [],
    format: 'pdf',
    include_charts: true,
    include_recommendations: true,
  });
  
  const [generateReport, { isLoading }] = useGenerateReportMutation();

  const reportTypes = [
    { value: 'score_breakdown', label: 'Score Breakdown Report' },
    { value: 'risk_assessment', label: 'Risk Assessment Report' },
    { value: 'comparative_analysis', label: 'Comparative Analysis Report' },
    { value: 'portfolio_summary', label: 'Portfolio Summary Report' },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'html', label: 'HTML Report' },
    { value: 'json', label: 'JSON Data' },
  ];

  const grades = [
    { value: '', label: 'All Grades' },
    { value: 'A', label: 'Grade A' },
    { value: 'B', label: 'Grade B' },
    { value: 'C', label: 'Grade C' },
    { value: 'R', label: 'Grade R' },
  ];

  const riskLevels = [
    { value: '', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'very_high', label: 'Very High Risk' },
  ];

  const handleGenerate = async () => {
    try {
      if (config.application_ids.length === 0) {
        toast.error('Please specify at least one application ID');
        return;
      }

      const result = await generateReport(config).unwrap();
      
      toast.success('Report generated successfully!');
      onReportGenerated?.(result.data.report_id);
      setIsOpen(false);
      
      // Auto-download if PDF
      if (config.format === 'pdf') {
        window.open(result.data.download_url, '_blank');
      }
      
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to generate report');
    }
  };

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateFilters = (updates: Partial<ReportConfig['filters']>) => {
    setConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, ...updates }
    }));
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Generate Report
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Generate Report"
        size="lg"
      >
        <div className="space-y-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <Select
              options={reportTypes}
              value={config.report_type}
              onChange={(value) => updateConfig({ report_type: value as any })}
            />
          </div>

          {/* Application IDs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application IDs (comma-separated)
            </label>
            <Input
              placeholder="APP-001, APP-002, APP-003..."
              value={config.application_ids.join(', ')}
              onChange={(e) => updateConfig({
                application_ids: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              })}
              helperText="Enter specific application IDs or leave empty to use filters"
            />
          </div>

          {/* Filters */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap-2 font-medium mb-4">
              <Settings className="h-4 w-4" />
              Report Options
            </h3>
            
            <div className="space-y-4">
              <Select
                label="Format"
                options={formats}
                value={config.format}
                onChange={(value) => updateConfig({ format: value as any })}
              />
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.include_charts}
                    onChange={(e) => updateConfig({ include_charts: e.target.checked })}
                    className="mr-2"
                  />
                  Include Charts and Graphs
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.include_recommendations}
                    onChange={(e) => updateConfig({ include_recommendations: e.target.checked })}
                    className="mr-2"
                  />
                  Include Recommendations
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} loading={isLoading} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
