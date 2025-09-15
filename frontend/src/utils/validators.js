import { VALIDATION_RULES, MIN_VALUES, ERROR_MESSAGES } from './constants';
// Basic field validators
export const validators = {
    required: (value) => {
        const isEmpty = value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0);
        return {
            isValid: !isEmpty,
            error: isEmpty ? ERROR_MESSAGES.REQUIRED_FIELD : undefined
        };
    },
    email: (email) => {
        if (!email)
            return { isValid: true }; // Optional field
        const isValid = VALIDATION_RULES.EMAIL.test(email);
        return {
            isValid,
            error: !isValid ? ERROR_MESSAGES.INVALID_EMAIL : undefined
        };
    },
    phone: (phone) => {
        if (!phone)
            return validators.required(phone);
        const isValid = VALIDATION_RULES.PHONE.test(phone);
        return {
            isValid,
            error: !isValid ? ERROR_MESSAGES.INVALID_PHONE : undefined
        };
    },
    nationalId: (nid) => {
        if (!nid)
            return validators.required(nid);
        const isValid = VALIDATION_RULES.NATIONAL_ID.test(nid);
        return {
            isValid,
            error: !isValid ? 'Please enter a valid National ID (10, 13, or 17 digits)' : undefined
        };
    },
    amount: (amount, min, max) => {
        if (!amount && amount !== 0)
            return { isValid: true }; // Optional field
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount) || numAmount < 0) {
            return { isValid: false, error: ERROR_MESSAGES.INVALID_AMOUNT };
        }
        if (min !== undefined && numAmount < min) {
            return { isValid: false, error: ERROR_MESSAGES.MIN_AMOUNT(min) };
        }
        if (max !== undefined && numAmount > max) {
            return { isValid: false, error: ERROR_MESSAGES.MAX_AMOUNT(max) };
        }
        return { isValid: true };
    },
    percentage: (value) => {
        if (!value && value !== 0)
            return { isValid: true };
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return { isValid: false, error: 'Please enter a valid percentage (0-100)' };
        }
        return { isValid: true };
    },
    positiveInteger: (value, min = 0) => {
        if (!value && value !== 0)
            return { isValid: true };
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(numValue) || numValue < min || !Number.isInteger(numValue)) {
            return { isValid: false, error: `Please enter a valid number (minimum ${min})` };
        }
        return { isValid: true };
    },
    businessType: (businessType) => {
        if (!businessType)
            return validators.required(businessType);
        // You could validate against your BUSINESS_TYPES constant here
        return { isValid: true };
    },
    fiType: (fiType) => {
        const validTypes = ['supplier', 'mfi', 'nbfi', 'bank', 'drutoloan'];
        const isValid = validTypes.includes(fiType === null || fiType === void 0 ? void 0 : fiType.toLowerCase());
        return {
            isValid,
            error: !isValid ? 'Please select a valid financial institution type' : undefined
        };
    }
};
// Composite validators for complex objects
export const validateBorrowerInfo = (borrowerInfo) => {
    const errors = [];
    const warnings = [];
    // Required fields
    const fullNameResult = validators.required(borrowerInfo.full_name);
    if (!fullNameResult.isValid)
        errors.push(`Full Name: ${fullNameResult.error}`);
    const phoneResult = validators.phone(borrowerInfo.phone || '');
    if (!phoneResult.isValid)
        errors.push(`Phone: ${phoneResult.error}`);
    const nidResult = validators.nationalId(borrowerInfo.national_id || '');
    if (!nidResult.isValid)
        errors.push(`National ID: ${nidResult.error}`);
    const addressResult = validators.required(borrowerInfo.address);
    if (!addressResult.isValid)
        errors.push(`Address: ${addressResult.error}`);
    const residencyResult = validators.required(borrowerInfo.residency_status);
    if (!residencyResult.isValid)
        errors.push(`Residency Status: ${residencyResult.error}`);
    // Optional but validated fields
    if (borrowerInfo.email) {
        const emailResult = validators.email(borrowerInfo.email);
        if (!emailResult.isValid)
            errors.push(`Email: ${emailResult.error}`);
    }
    // Warnings
    if (!borrowerInfo.guarantor_category) {
        warnings.push('No guarantor information provided - this may affect credit scoring');
    }
    if (borrowerInfo.years_of_residency && borrowerInfo.years_of_residency < 2) {
        warnings.push('Short residency duration may impact credit assessment');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};
export const validateBusinessData = (businessData) => {
    const errors = [];
    const warnings = [];
    // Required fields
    const businessNameResult = validators.required(businessData.business_name);
    if (!businessNameResult.isValid)
        errors.push(`Business Name: ${businessNameResult.error}`);
    const businessTypeResult = validators.required(businessData.business_type);
    if (!businessTypeResult.isValid)
        errors.push(`Business Type: ${businessTypeResult.error}`);
    // Financial validation
    if (businessData.average_daily_sales) {
        const salesResult = validators.amount(businessData.average_daily_sales, MIN_VALUES.DAILY_SALES);
        if (!salesResult.isValid)
            errors.push(`Daily Sales: ${salesResult.error}`);
    }
    if (businessData.last_month_sales) {
        const monthlySalesResult = validators.amount(businessData.last_month_sales, 0);
        if (!monthlySalesResult.isValid)
            errors.push(`Monthly Sales: ${monthlySalesResult.error}`);
    }
    // Consistency checks
    if (businessData.average_daily_sales && businessData.last_month_sales) {
        const expectedMonthlySales = businessData.average_daily_sales * 30;
        const actualMonthlySales = businessData.last_month_sales;
        const variance = Math.abs(expectedMonthlySales - actualMonthlySales) / expectedMonthlySales;
        if (variance > 0.5) { // 50% variance threshold
            warnings.push('Large discrepancy between daily and monthly sales figures');
        }
    }
    // Business age validation
    if (businessData.years_of_operation !== undefined) {
        const yearsResult = validators.positiveInteger(businessData.years_of_operation, 0);
        if (!yearsResult.isValid)
            errors.push(`Years of Operation: ${yearsResult.error}`);
        else if (businessData.years_of_operation < 1) {
            warnings.push('New business (less than 1 year) may have limited credit options');
        }
    }
    // Expense validation
    if (businessData.total_expense_last_month && businessData.last_month_sales) {
        const expenseRatio = businessData.total_expense_last_month / businessData.last_month_sales;
        if (expenseRatio > 0.8) {
            warnings.push('High expense ratio (>80%) may indicate financial stress');
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};
export const validateFinancialData = (financialData) => {
    const errors = [];
    const warnings = [];
    // Income validation
    if (financialData.monthly_income) {
        const incomeResult = validators.amount(financialData.monthly_income, MIN_VALUES.MONTHLY_INCOME);
        if (!incomeResult.isValid)
            errors.push(`Monthly Income: ${incomeResult.error}`);
    }
    // Loan validation
    if (financialData.existing_loans && financialData.existing_loans.length > 0) {
        let totalInstallments = 0;
        financialData.existing_loans.forEach((loan, index) => {
            const loanValidation = validateLoanInfo(loan);
            if (!loanValidation.isValid) {
                loanValidation.errors.forEach(error => {
                    errors.push(`Loan ${index + 1}: ${error}`);
                });
            }
            totalInstallments += loan.monthly_installment || 0;
        });
        // Debt burden check
        if (financialData.monthly_income && totalInstallments > 0) {
            const debtBurdenRatio = totalInstallments / financialData.monthly_income;
            if (debtBurdenRatio > 0.6) {
                warnings.push(`High debt burden ratio (${(debtBurdenRatio * 100).toFixed(1)}%)`);
            }
        }
    }
    // Asset validation
    if (financialData.total_assets) {
        const assetsResult = validators.amount(financialData.total_assets, 0);
        if (!assetsResult.isValid)
            errors.push(`Total Assets: ${assetsResult.error}`);
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};
export const validateLoanInfo = (loanInfo) => {
    var _a;
    const errors = [];
    const warnings = [];
    // Required fields
    const fiNameResult = validators.required(loanInfo.fi_name);
    if (!fiNameResult.isValid)
        errors.push(`FI Name: ${fiNameResult.error}`);
    const fiTypeResult = validators.fiType(loanInfo.fi_type || '');
    if (!fiTypeResult.isValid)
        errors.push(`FI Type: ${fiTypeResult.error}`);
    // Amount validations
    if (loanInfo.loan_amount) {
        const loanAmountResult = validators.amount(loanInfo.loan_amount, MIN_VALUES.LOAN_AMOUNT);
        if (!loanAmountResult.isValid)
            errors.push(`Loan Amount: ${loanAmountResult.error}`);
    }
    if (loanInfo.outstanding_loan) {
        const outstandingResult = validators.amount(loanInfo.outstanding_loan, 0);
        if (!outstandingResult.isValid)
            errors.push(`Outstanding Loan: ${outstandingResult.error}`);
    }
    if (loanInfo.monthly_installment) {
        const installmentResult = validators.amount(loanInfo.monthly_installment, 0);
        if (!installmentResult.isValid)
            errors.push(`Monthly Installment: ${installmentResult.error}`);
    }
    // Logical validations
    if (loanInfo.outstanding_loan && loanInfo.loan_amount &&
        loanInfo.outstanding_loan > loanInfo.loan_amount) {
        errors.push('Outstanding loan cannot be greater than original loan amount');
    }
    if (loanInfo.repaid_percentage !== undefined) {
        const repaidResult = validators.percentage(loanInfo.repaid_percentage);
        if (!repaidResult.isValid)
            errors.push(`Repaid Percentage: ${repaidResult.error}`);
        if (loanInfo.repaid_percentage < 25) {
            warnings.push('Low repayment progress may indicate repayment difficulties');
        }
    }
    // Repayment status warnings
    if (loanInfo.repayment_status === 'default') {
        warnings.push('Default status will significantly impact credit scoring');
    }
    else if ((_a = loanInfo.repayment_status) === null || _a === void 0 ? void 0 : _a.includes('overdue')) {
        warnings.push('Overdue payments may negatively affect credit score');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};
// Full application validator
export const validateCreditApplication = (application) => {
    const allErrors = [];
    const allWarnings = [];
    // Validate each section
    const borrowerValidation = validateBorrowerInfo(application.borrower_info);
    const businessValidation = validateBusinessData(application.business_data);
    const financialValidation = validateFinancialData(application.financial_data);
    allErrors.push(...borrowerValidation.errors);
    allErrors.push(...businessValidation.errors);
    allErrors.push(...financialValidation.errors);
    allWarnings.push(...borrowerValidation.warnings);
    allWarnings.push(...businessValidation.warnings);
    allWarnings.push(...financialValidation.warnings);
    // Cross-section validations
    if (application.financial_data.monthly_income && application.business_data.last_month_sales) {
        if (application.financial_data.monthly_income > application.business_data.last_month_sales * 2) {
            allWarnings.push('Declared income significantly higher than business revenue');
        }
    }
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
};
// Real-time validation helper
export const validateField = (fieldName, value, context) => {
    switch (fieldName) {
        case 'email':
            return validators.email(value);
        case 'phone':
            return validators.phone(value);
        case 'national_id':
            return validators.nationalId(value);
        case 'loan_amount':
        case 'monthly_income':
            return validators.amount(value, MIN_VALUES.LOAN_AMOUNT);
        case 'percentage':
            return validators.percentage(value);
        default:
            if (value === null || value === undefined || value === '') {
                return validators.required(value);
            }
            return { isValid: true };
    }
};
export default {
    validators,
    validateBorrowerInfo,
    validateBusinessData,
    validateFinancialData,
    validateLoanInfo,
    validateCreditApplication,
    validateField
};
