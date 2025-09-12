export { ReportGenerator } from './ReportGenerator/ReportGenerator';
export { ScoreBreakdown } from './ScoreBreakdown/ScoreBreakdown';
export { TrendAnalysis } from './TrendAnalysis/TrendAnalysis';-2 font-medium mb-4">
              <Filter className="h-4 w-4" />
              Filters (applied when no specific IDs provided)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Grade"
                options={grades}
                value={config.filters?.grade || ''}
                onChange={(value) => updateFilters({ grade: value })}
              />
              
              <Select
                label="Risk Level"
                options={riskLevels}
                value={config.filters?.risk_level || ''}
                onChange={(value) => updateFilters({ risk_level: value })}
              />
              
              <Input
                label="Business Type"
                placeholder="e.g., Grocery Shop"
                value={config.filters?.business_type || ''}
                onChange={(e) => updateFilters({ business_type: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap-2 font-medium mb-4">
              <Calendar className="h-4 w-4" />
              Date Range
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={config.date_range?.start || ''}
                onChange={(e) => updateConfig({
                  date_range: { ...config.date_range, start: e.target.value }
                })}
              />
              
              <Input
                label="End Date"
                type="date"
                value={config.date_range?.end || ''}
                onChange={(e) => updateConfig({
                  date_range: { ...config.date_range, end: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Report Options */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap