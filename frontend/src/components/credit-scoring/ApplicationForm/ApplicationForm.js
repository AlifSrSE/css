import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Textarea, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger, Separator, Badge, Progress, } from '@/components/ui';
import { Plus, Trash2, User, Building2, DollarSign, FileText, AlertTriangle } from 'lucide-react';
// Validation schema
const applicationSchema = yup.object({
    borrower_info: yup.object({
        full_name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
        phone: yup.string().required('Phone is required').matches(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
        email: yup.string().email('Invalid email format'),
        national_id: yup.string().required('National ID is required'),
        address: yup.string().required('Address is required'),
        residency_status: yup.string().oneOf(['permanent', 'temporary']).required('Residency status is required'),
        years_of_residency: yup.number().min(0, 'Years must be positive'),
        guarantor_category: yup.string().oneOf(['strong', 'medium', 'weak']),
    }).required(),
    business_data: yup.object({
        business_name: yup.string().required('Business name is required'),
        business_type: yup.string().required('Business type is required'),
        seller_type: yup.string().oneOf(['wholesaler', 'retailer']),
        years_of_operation: yup.number().min(0, 'Years must be positive'),
        average_daily_sales: yup.number().min(0, 'Sales must be positive'),
        last_month_sales: yup.number().min(0, 'Sales must be positive'),
        inventory_value_present: yup.number().min(0, 'Value must be positive'),
        total_expense_last_month: yup.number().min(0, 'Expenses must be positive'),
        personal_expense: yup.number().min(0, 'Expenses must be positive'),
    }).required(),
    financial_data: yup.object({
        monthly_income: yup.number().min(0, 'Income must be positive'),
        bank_transaction_volume_1y: yup.number().min(0, 'Volume must be positive'),
        existing_loans: yup.array().of(yup.object({
            fi_name: yup.string().required('FI name is required'),
            fi_type: yup.string().oneOf(['supplier', 'mfi', 'nbfi', 'bank', 'drutoloan']).required(),
            loan_amount: yup.number().min(0, 'Amount must be positive').required(),
            outstanding_loan: yup.number().min(0, 'Amount must be positive').required(),
            monthly_installment: yup.number().min(0, 'Amount must be positive').required(),
            repaid_percentage: yup.number().min(0, 'Percentage must be positive').max(100, 'Cannot exceed 100%').required(),
            repayment_status: yup.string().oneOf(['on_time', 'overdue_3_days', 'overdue_7_days', 'default']).required(),
        })),
    }).required(),
    loan_details: yup.object({
        amount_requested: yup.number().min(1, 'Loan amount must be positive'),
        purpose: yup.string(),
    }),
});
const businessTypes = [
    'Grocery Shop', 'Cosmetics', 'Medicine', 'Clothing Shop', 'Wholesalers',
    'Bakery', 'Restaurant', 'Library', 'Hardware', 'Sanitary', 'Tea Stall',
    'Motor Parts', 'Sports Shop', 'Tailor', 'Shoe Seller', 'Plastic Items',
    'Salon', 'Ladies Parlor', 'Poultry Shop', 'Vegetable Shop', 'Garage',
    'Super Shop', 'Mobile Shop', 'Accessories', 'Servicing', 'Other'
];
const fiTypes = [
    { value: 'supplier', label: 'Supplier' },
    { value: 'mfi', label: 'MFI (Microfinance Institution)' },
    { value: 'nbfi', label: 'NBFI (Non-Bank Financial Institution)' },
    { value: 'bank', label: 'Bank' },
    { value: 'drutoloan', label: 'DrutoLoan' },
];
const repaymentStatuses = [
    { value: 'on_time', label: 'On Time' },
    { value: 'overdue_3_days', label: 'Overdue (≤3 days)' },
    { value: 'overdue_7_days', label: 'Overdue (≤7 days)' },
    { value: 'default', label: 'Default' },
];
export const ApplicationForm = ({ onSubmit, initialData, isLoading = false, errors: externalErrors, }) => {
    var _a, _b, _c, _d, _e;
    const [activeTab, setActiveTab] = useState('borrower');
    const [formProgress, setFormProgress] = useState(0);
    const { control, handleSubmit, watch, setValue, formState: { errors: formErrors, isValid }, reset, } = useForm({
        resolver: yupResolver(applicationSchema),
        defaultValues: {
            borrower_info: Object.assign({ residency_status: 'permanent', guarantor_category: 'medium' }, initialData === null || initialData === void 0 ? void 0 : initialData.borrower_info),
            business_data: Object.assign({ seller_type: 'retailer' }, initialData === null || initialData === void 0 ? void 0 : initialData.business_data),
            financial_data: Object.assign({ existing_loans: [] }, initialData === null || initialData === void 0 ? void 0 : initialData.financial_data),
            loan_details: (initialData === null || initialData === void 0 ? void 0 : initialData.loan_details) || {},
        },
        mode: 'onChange',
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'financial_data.existing_loans',
    });
    const watchedFields = watch();
    // Calculate form completion progress
    useEffect(() => {
        const calculateProgress = () => {
            const requiredFields = [
                'borrower_info.full_name',
                'borrower_info.phone',
                'borrower_info.national_id',
                'borrower_info.address',
                'business_data.business_name',
                'business_data.business_type',
                'financial_data.monthly_income',
            ];
            const completedFields = requiredFields.filter(field => {
                const value = field.split('.').reduce((obj, key) => obj === null || obj === void 0 ? void 0 : obj[key], watchedFields);
                return value && value !== '';
            });
            setFormProgress((completedFields.length / requiredFields.length) * 100);
        };
        calculateProgress();
    }, [watchedFields]);
    const addLoan = () => {
        append({
            fi_name: '',
            fi_type: 'bank',
            loan_type: '',
            loan_amount: 0,
            tenure_years: 1,
            outstanding_loan: 0,
            monthly_installment: 0,
            overdue_amount: 0,
            repayment_status: 'on_time',
            repaid_percentage: 0,
        });
    };
    const handleFormSubmit = (data) => {
        onSubmit(data);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsx("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "Credit Application Form"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600", children: [_jsx("span", { children: "Form Completion" }), _jsxs("span", { children: [Math.round(formProgress), "%"] })] }), _jsx(Progress, { value: formProgress, className: "h-2" })] })] }), _jsxs(CardContent, { children: [externalErrors && (_jsxs(Alert, { className: "mb-6", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Please correct the errors below before submitting." })] })), _jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), className: "space-y-6", children: [_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "borrower", className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4" }), "Borrower Info"] }), _jsxs(TabsTrigger, { value: "business", className: "flex items-center gap-2", children: [_jsx(Building2, { className: "h-4 w-4" }), "Business Data"] }), _jsxs(TabsTrigger, { value: "financial", className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-4 w-4" }), "Financial Data"] }), _jsxs(TabsTrigger, { value: "loan", className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Loan Details"] })] }), _jsx(TabsContent, { value: "borrower", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "full_name", children: "Full Name *" }), _jsx(Controller, { name: "borrower_info.full_name", control: control, render: ({ field }) => {
                                                                    var _a, _b;
                                                                    return (_jsx(Input, Object.assign({}, field, { id: "full_name", placeholder: "Enter full name", error: (_b = (_a = formErrors.borrower_info) === null || _a === void 0 ? void 0 : _a.full_name) === null || _b === void 0 ? void 0 : _b.message })));
                                                                } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number *" }), _jsx(Controller, { name: "borrower_info.phone", control: control, render: ({ field }) => {
                                                                    var _a, _b;
                                                                    return (_jsx(Input, Object.assign({}, field, { id: "phone", placeholder: "+880XXXXXXXXX", error: (_b = (_a = formErrors.borrower_info) === null || _a === void 0 ? void 0 : _a.phone) === null || _b === void 0 ? void 0 : _b.message })));
                                                                } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Controller, { name: "borrower_info.email", control: control, render: ({ field }) => {
                                                                    var _a, _b;
                                                                    return (_jsx(Input, Object.assign({}, field, { id: "email", type: "email", placeholder: "email@example.com", error: (_b = (_a = formErrors.borrower_info) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.message })));
                                                                } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "national_id", children: "National ID *" }), _jsx(Controller, { name: "borrower_info.national_id", control: control, render: ({ field }) => {
                                                                    var _a, _b;
                                                                    return (_jsx(Input, Object.assign({}, field, { id: "national_id", placeholder: "Enter National ID", error: (_b = (_a = formErrors.borrower_info) === null || _a === void 0 ? void 0 : _a.national_id) === null || _b === void 0 ? void 0 : _b.message })));
                                                                } })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "address", children: "Address *" }), _jsx(Controller, { name: "borrower_info.address", control: control, render: ({ field }) => {
                                                                    var _a, _b;
                                                                    return (_jsx(Textarea, Object.assign({}, field, { id: "address", placeholder: "Enter complete address", rows: 3, error: (_b = (_a = formErrors.borrower_info) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.message })));
                                                                } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "residency_status", children: "Residency Status *" }), _jsx(Controller, { name: "borrower_info.residency_status", control: control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select residency status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "permanent", children: "Permanent" }), _jsx(SelectItem, { value: "temporary", children: "Temporary" })] })] })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "years_of_residency", children: "Years of Residency" }), _jsx(Controller, { name: "borrower_info.years_of_residency", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "years_of_residency", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "guarantor_category", children: "Guarantor Category" }), _jsx(Controller, { name: "borrower_info.guarantor_category", control: control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select guarantor strength" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "strong", children: "Strong" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "weak", children: "Weak" })] })] })) })] })] }) }), _jsx(TabsContent, { value: "business", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "business_name", children: "Business Name *" }), _jsx(Controller, { name: "business_data.business_name", control: control, render: ({ field }) => {
                                                                    var _a, _b;
                                                                    return (_jsx(Input, Object.assign({}, field, { id: "business_name", placeholder: "Enter business name", error: (_b = (_a = formErrors.business_data) === null || _a === void 0 ? void 0 : _a.business_name) === null || _b === void 0 ? void 0 : _b.message })));
                                                                } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "business_type", children: "Business Type *" }), _jsx(Controller, { name: "business_data.business_type", control: control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select business type" }) }), _jsx(SelectContent, { children: businessTypes.map((type) => (_jsx(SelectItem, { value: type, children: type }, type))) })] })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "seller_type", children: "Seller Type" }), _jsx(Controller, { name: "business_data.seller_type", control: control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select seller type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "wholesaler", children: "Wholesaler" }), _jsx(SelectItem, { value: "retailer", children: "Retailer" })] })] })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "years_of_operation", children: "Years of Operation" }), _jsx(Controller, { name: "business_data.years_of_operation", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "years_of_operation", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "average_daily_sales", children: "Average Daily Sales (BDT)" }), _jsx(Controller, { name: "business_data.average_daily_sales", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "average_daily_sales", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "last_month_sales", children: "Last Month Sales (BDT)" }), _jsx(Controller, { name: "business_data.last_month_sales", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "last_month_sales", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inventory_value", children: "Current Inventory Value (BDT)" }), _jsx(Controller, { name: "business_data.inventory_value_present", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "inventory_value", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "total_expense", children: "Total Monthly Expenses (BDT)" }), _jsx(Controller, { name: "business_data.total_expense_last_month", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "total_expense", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "personal_expense", children: "Personal Monthly Expenses (BDT)" }), _jsx(Controller, { name: "business_data.personal_expense", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "personal_expense", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "rent_advance", children: "Rent Advance (BDT)" }), _jsx(Controller, { name: "business_data.rent_advance", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "rent_advance", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] })] }) }), _jsxs(TabsContent, { value: "financial", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "monthly_income", children: "Monthly Income (BDT)" }), _jsx(Controller, { name: "financial_data.monthly_income", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "monthly_income", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bank_volume", children: "Bank Transaction Volume (1 Year - BDT)" }), _jsx(Controller, { name: "financial_data.bank_transaction_volume_1y", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "bank_volume", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mfs_volume", children: "MFS Transaction Volume (Monthly - BDT)" }), _jsx(Controller, { name: "financial_data.mfs_transaction_volume_monthly", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "mfs_volume", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "total_assets", children: "Total Assets (BDT)" }), _jsx(Controller, { name: "financial_data.total_assets", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "total_assets", type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Existing Loans" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addLoan, className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Loan"] })] }), fields.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("p", { children: "No existing loans added" }), _jsx("p", { className: "text-sm", children: "Click \"Add Loan\" to include existing loan information" })] })), fields.map((field, index) => (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs(Badge, { variant: "outline", children: ["Loan #", index + 1] }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => remove(index), className: "text-red-600 hover:text-red-800", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Financial Institution Name *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.fi_name`, control: control, render: ({ field }) => {
                                                                                        var _a, _b, _c, _d;
                                                                                        return (_jsx(Input, Object.assign({}, field, { placeholder: "Enter FI name", error: (_d = (_c = (_b = (_a = formErrors.financial_data) === null || _a === void 0 ? void 0 : _a.existing_loans) === null || _b === void 0 ? void 0 : _b[index]) === null || _c === void 0 ? void 0 : _c.fi_name) === null || _d === void 0 ? void 0 : _d.message })));
                                                                                    } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "FI Type *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.fi_type`, control: control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select FI type" }) }), _jsx(SelectContent, { children: fiTypes.map((type) => (_jsx(SelectItem, { value: type.value, children: type.label }, type.value))) })] })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Loan Amount (BDT) *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.loan_amount`, control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Outstanding Amount (BDT) *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.outstanding_loan`, control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Monthly Installment (BDT) *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.monthly_installment`, control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { type: "number", min: "0", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Repaid Percentage (%) *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.repaid_percentage`, control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { type: "number", min: "0", max: "100", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Repayment Status *" }), _jsx(Controller, { name: `financial_data.existing_loans.${index}.repayment_status`, control: control, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select repayment status" }) }), _jsx(SelectContent, { children: repaymentStatuses.map((status) => (_jsx(SelectItem, { value: status.value, children: status.label }, status.value))) })] })) })] })] })] }, field.id)))] })] }), _jsxs(TabsContent, { value: "loan", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount_requested", children: "Loan Amount Requested (BDT)" }), _jsx(Controller, { name: "loan_details.amount_requested", control: control, render: ({ field }) => (_jsx(Input, Object.assign({}, field, { id: "amount_requested", type: "number", min: "1", placeholder: "0", onChange: (e) => field.onChange(Number(e.target.value)) }))) })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "loan_purpose", children: "Loan Purpose" }), _jsx(Controller, { name: "loan_details.purpose", control: control, render: ({ field }) => (_jsx(Textarea, Object.assign({}, field, { id: "loan_purpose", placeholder: "Describe the purpose of the loan", rows: 4 }))) })] })] }), _jsxs(Card, { className: "mt-6", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Application Summary" }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "Borrower:" }), " ", ((_a = watchedFields.borrower_info) === null || _a === void 0 ? void 0 : _a.full_name) || 'Not provided'] }), _jsxs("div", { children: [_jsx("strong", { children: "Business:" }), " ", ((_b = watchedFields.business_data) === null || _b === void 0 ? void 0 : _b.business_name) || 'Not provided'] }), _jsxs("div", { children: [_jsx("strong", { children: "Business Type:" }), " ", ((_c = watchedFields.business_data) === null || _c === void 0 ? void 0 : _c.business_type) || 'Not selected'] }), _jsxs("div", { children: [_jsx("strong", { children: "Monthly Income:" }), " ", ((_d = watchedFields.financial_data) === null || _d === void 0 ? void 0 : _d.monthly_income)
                                                                                ? formatCurrency(watchedFields.financial_data.monthly_income)
                                                                                : 'Not provided'] }), _jsxs("div", { children: [_jsx("strong", { children: "Existing Loans:" }), " ", fields.length, " loan(s)"] }), _jsxs("div", { children: [_jsx("strong", { children: "Requested Amount:" }), " ", ((_e = watchedFields.loan_details) === null || _e === void 0 ? void 0 : _e.amount_requested)
                                                                                ? formatCurrency(watchedFields.loan_details.amount_requested)
                                                                                : 'Not specified'] })] }) })] })] })] }), _jsxs("div", { className: "flex justify-between pt-6 border-t", children: [_jsx("div", { className: "flex gap-2", children: activeTab !== 'borrower' && (_jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                    const tabs = ['borrower', 'business', 'financial', 'loan'];
                                                    const currentIndex = tabs.indexOf(activeTab);
                                                    if (currentIndex > 0) {
                                                        setActiveTab(tabs[currentIndex - 1]);
                                                    }
                                                }, children: "Previous" })) }), _jsxs("div", { className: "flex gap-2", children: [activeTab !== 'loan' && (_jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                        const tabs = ['borrower', 'business', 'financial', 'loan'];
                                                        const currentIndex = tabs.indexOf(activeTab);
                                                        if (currentIndex < tabs.length - 1) {
                                                            setActiveTab(tabs[currentIndex + 1]);
                                                        }
                                                    }, children: "Next" })), _jsx(Button, { type: "submit", disabled: isLoading || !isValid, className: "min-w-[120px]", children: isLoading ? 'Submitting...' : 'Submit Application' })] })] })] })] })] }) }));
};
