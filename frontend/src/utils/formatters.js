import { CURRENCY_FORMAT, DATE_FORMATS } from './constants';
export const formatters = {
    currency: (amount, options) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount))
            return '৳0';
        return new Intl.NumberFormat(CURRENCY_FORMAT.LOCALE, Object.assign({ style: 'currency', currency: CURRENCY_FORMAT.CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 2 }, options)).format(numAmount);
    },
    // Compact currency (e.g., 1.2M, 500K)
    compactCurrency: (amount) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount))
            return '৳0';
        if (numAmount >= 10000000) { // 1 Crore
            return `৳${(numAmount / 10000000).toFixed(1)}Cr`;
        }
        else if (numAmount >= 100000) { // 1 Lakh
            return `৳${(numAmount / 100000).toFixed(1)}L`;
        }
        else if (numAmount >= 1000) { // 1 Thousand
            return `৳${(numAmount / 1000).toFixed(1)}K`;
        }
        return formatters.currency(numAmount);
    },
    // Number formatting
    number: (value, decimals = 0) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue))
            return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(numValue);
    },
    // Percentage formatting
    percentage: (value, decimals = 1) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue))
            return '0%';
        return `${numValue.toFixed(decimals)}%`;
    },
    // Date formatting
    date: (date, format = DATE_FORMATS.SHORT) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime()))
                return 'Invalid Date';
            switch (format) {
                case DATE_FORMATS.SHORT:
                    return dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric'
                    });
                case DATE_FORMATS.LONG:
                    return dateObj.toLocaleDateString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric'
                    });
                case DATE_FORMATS.WITH_TIME:
                    return dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                case DATE_FORMATS.TIME_ONLY:
                    return dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                case DATE_FORMATS.ISO:
                    return dateObj.toISOString().split('T')[0];
                default:
                    return dateObj.toLocaleDateString();
            }
        }
        catch (error) {
            return 'Invalid Date';
        }
    },
    // Relative time formatting (e.g., "2 hours ago", "3 days ago")
    relativeTime: (date) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const now = new Date();
            const diffMs = now.getTime() - dateObj.getTime();
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffMinutes < 1)
                return 'Just now';
            if (diffMinutes < 60)
                return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            if (diffHours < 24)
                return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7)
                return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            if (diffDays < 30)
                return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
            if (diffDays < 365)
                return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
            return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
        }
        catch (error) {
            return 'Unknown time';
        }
    },
    // Phone number formatting
    phone: (phoneNumber) => {
        if (!phoneNumber)
            return '';
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        // Format as +88-01XXX-XXXXXX
        if (cleaned.length === 11 && cleaned.startsWith('01')) {
            return `+88-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        else if (cleaned.length === 13 && cleaned.startsWith('88')) {
            return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
        }
        return phoneNumber; // Return as-is if doesn't match expected format
    },
    // Credit score formatting with grade
    creditScore: (score, grade) => {
        const formattedScore = score.toFixed(1);
        return grade ? `${formattedScore} (${grade})` : formattedScore;
    },
    // Risk level formatting with color coding
    riskLevel: (riskLevel) => {
        const riskMap = {
            low: { text: 'Low Risk', color: '#10B981' },
            medium: { text: 'Medium Risk', color: '#F59E0B' },
            high: { text: 'High Risk', color: '#F97316' },
            very_high: { text: 'Very High Risk', color: '#EF4444' }
        };
        return riskMap[riskLevel.toLowerCase()] || { text: riskLevel, color: '#6B7280' };
    },
    // Grade formatting with color
    grade: (grade) => {
        const gradeMap = {
            A: { text: 'Grade A', color: '#10B981', description: 'Excellent' },
            B: { text: 'Grade B', color: '#3B82F6', description: 'Good' },
            C: { text: 'Grade C', color: '#F59E0B', description: 'Fair' },
            R: { text: 'Rejected', color: '#EF4444', description: 'Poor' }
        };
        return gradeMap[grade.toUpperCase()] || { text: grade, color: '#6B7280', description: 'Unknown' };
    },
    // Application status formatting
    status: (status) => {
        const statusMap = {
            pending: { text: 'Pending', color: '#6B7280' },
            processing: { text: 'Processing', color: '#3B82F6' },
            completed: { text: 'Completed', color: '#10B981' },
            rejected: { text: 'Rejected', color: '#EF4444' }
        };
        return statusMap[status.toLowerCase()] || { text: status, color: '#6B7280' };
    },
    // File size formatting
    fileSize: (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    },
    // Duration formatting (in minutes)
    duration: (minutes) => {
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        return `${hours}h ${remainingMinutes}m`;
    },
    // Text truncation
    truncate: (text, maxLength = 50) => {
        if (text.length <= maxLength)
            return text;
        return text.slice(0, maxLength - 3) + '...';
    },
    // Name formatting
    fullName: (firstName, lastName) => {
        const first = (firstName === null || firstName === void 0 ? void 0 : firstName.trim()) || '';
        const last = (lastName === null || lastName === void 0 ? void 0 : lastName.trim()) || '';
        if (!first && !last)
            return 'Unknown';
        if (!first)
            return last;
        if (!last)
            return first;
        return `${first} ${last}`;
    },
    // Initials generation
    initials: (firstName, lastName) => {
        var _a, _b, _c, _d;
        const first = ((_b = (_a = firstName === null || firstName === void 0 ? void 0 : firstName.trim()) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || '';
        const last = ((_d = (_c = lastName === null || lastName === void 0 ? void 0 : lastName.trim()) === null || _c === void 0 ? void 0 : _c.charAt(0)) === null || _d === void 0 ? void 0 : _d.toUpperCase()) || '';
        return `${first}${last}` || '?';
    },
    // Business type formatting
    businessType: (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },
    // Array to comma-separated string
    arrayToString: (arr, conjunction = 'and') => {
        if (!arr || arr.length === 0)
            return '';
        if (arr.length === 1)
            return arr[0];
        if (arr.length === 2)
            return `${arr[0]} ${conjunction} ${arr[1]}`;
        return `${arr.slice(0, -1).join(', ')} ${conjunction} ${arr[arr.length - 1]}`;
    },
    // Score band formatting
    scoreBand: (score) => {
        if (score >= 80)
            return { band: 'Excellent', color: '#10B981' };
        if (score >= 65)
            return { band: 'Good', color: '#3B82F6' };
        if (score >= 50)
            return { band: 'Fair', color: '#F59E0B' };
        if (score >= 35)
            return { band: 'Poor', color: '#F97316' };
        return { band: 'Very Poor', color: '#EF4444' };
    },
    // Address formatting
    address: (addressObj) => {
        const parts = [
            addressObj.street,
            addressObj.city,
            addressObj.state,
            addressObj.country,
            addressObj.postalCode
        ].filter(Boolean);
        return parts.join(', ') || 'Address not provided';
    },
    // Loan tenure formatting
    loanTenure: (months) => {
        if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
            return `${years} year${years !== 1 ? 's' : ''}`;
        }
        return `${years}y ${remainingMonths}m`;
    },
    // Ratio formatting
    ratio: (numerator, denominator, suffix = '%') => {
        if (denominator === 0)
            return 'N/A';
        const ratio = (numerator / denominator) * 100;
        return `${ratio.toFixed(1)}${suffix}`;
    },
    // Credit history formatting
    creditHistory: (repaidPercentage, status) => {
        const percentage = formatters.percentage(repaidPercentage);
        const statusFormatted = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return `${percentage} repaid - ${statusFormatted}`;
    },
    // Psychometric score interpretation
    psychometricScore: (score) => {
        if (score >= 90)
            return { interpretation: 'Excellent financial behavior', color: '#10B981' };
        if (score >= 80)
            return { interpretation: 'Good financial behavior', color: '#3B82F6' };
        if (score >= 60)
            return { interpretation: 'Average financial behavior', color: '#F59E0B' };
        if (score >= 40)
            return { interpretation: 'Below average financial behavior', color: '#F97316' };
        return { interpretation: 'Poor financial behavior', color: '#EF4444' };
    },
    // Red flag severity formatting
    redFlagSeverity: (severity) => {
        const severityMap = {
            low: { text: 'Low', color: '#10B981', icon: 'info-circle' },
            medium: { text: 'Medium', color: '#F59E0B', icon: 'alert-triangle' },
            high: { text: 'High', color: '#F97316', icon: 'alert-triangle' },
            critical: { text: 'Critical', color: '#EF4444', icon: 'alert-octagon' }
        };
        return severityMap[severity.toLowerCase()] || { text: severity, color: '#6B7280', icon: 'help-circle' };
    }
};
// Utility functions for data export
export const exportFormatters = {
    // CSV safe formatting
    csvSafe: (value) => {
        if (value === null || value === undefined)
            return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    },
    // Excel safe formatting
    excelSafe: (value) => {
        if (value === null || value === undefined)
            return '';
        if (typeof value === 'string' && value.startsWith('=')) {
            return `'${value}`;
        }
        return value;
    }
};
// Validation helpers for formatting
export const formatValidation = {
    isValidDate: (date) => {
        try {
            const dateObj = new Date(date);
            return !isNaN(dateObj.getTime());
        }
        catch (_a) {
            return false;
        }
    },
    isValidNumber: (value) => {
        return typeof value === 'number' && !isNaN(value);
    },
    isValidCurrency: (value) => {
        return formatValidation.isValidNumber(value) && value >= 0;
    }
};
export default {
    formatters,
    exportFormatters,
    formatValidation
};
