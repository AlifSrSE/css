import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Textarea,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Badge,
  Progress,
} from '@/components/ui';
import { Plus, Trash2, User, Building2, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import type { ApplicationFormData, FormErrors, LoanInfo } from '../../../types/scoring';

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
    existing_loans: yup.array().of(
      yup.object({
        fi_name: yup.string().required('FI name is required'),
        fi_type: yup.string().oneOf(['supplier', 'mfi', 'nbfi', 'bank', 'drutoloan']).required(),
        loan_amount: yup.number().min(0, 'Amount must be positive').required(),
        outstanding_loan: yup.number().min(0, 'Amount must be positive').required(),
        monthly_installment: yup.number().min(0, 'Amount must be positive').required(),
        repaid_percentage: yup.number().min(0, 'Percentage must be positive').max(100, 'Cannot exceed 100%').required(),
        repayment_status: yup.string().oneOf(['on_time', 'overdue_3_days', 'overdue_7_days', 'default']).required(),
      })
    ),
  }).required(),
  
  loan_details: yup.object({
    amount_requested: yup.number().min(1, 'Loan amount must be positive'),
    purpose: yup.string(),
  }),
});

interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => void;
  initialData?: Partial<ApplicationFormData>;
  isLoading?: boolean;
  errors?: FormErrors;
}

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

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  errors: externalErrors,
}) => {
  const [activeTab, setActiveTab] = useState('borrower');
  const [formProgress, setFormProgress] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors, isValid },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: yupResolver(applicationSchema),
    defaultValues: {
      borrower_info: {
        residency_status: 'permanent',
        guarantor_category: 'medium',
        ...initialData?.borrower_info,
      },
      business_data: {
        seller_type: 'retailer',
        ...initialData?.business_data,
      },
      financial_data: {
        existing_loans: [],
        ...initialData?.financial_data,
      },
      loan_details: initialData?.loan_details || {},
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
        const value = field.split('.').reduce((obj: any, key) => obj?.[key], watchedFields);
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

  const handleFormSubmit = (data: ApplicationFormData) => {
    onSubmit(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Credit Application Form
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Form Completion</span>
              <span>{Math.round(formProgress)}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          {externalErrors && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please correct the errors below before submitting.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="borrower" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Borrower Info
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Data
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Data
                </TabsTrigger>
                <TabsTrigger value="loan" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Loan Details
                </TabsTrigger>
              </TabsList>

              {/* Borrower Information Tab */}
              <TabsContent value="borrower" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Controller
                      name="borrower_info.full_name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="full_name"
                          placeholder="Enter full name"
                          error={formErrors.borrower_info?.full_name?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Controller
                      name="borrower_info.phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phone"
                          placeholder="+880XXXXXXXXX"
                          error={formErrors.borrower_info?.phone?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Controller
                      name="borrower_info.email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          error={formErrors.borrower_info?.email?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="national_id">National ID *</Label>
                    <Controller
                      name="borrower_info.national_id"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="national_id"
                          placeholder="Enter National ID"
                          error={formErrors.borrower_info?.national_id?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Controller
                      name="borrower_info.address"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="address"
                          placeholder="Enter complete address"
                          rows={3}
                          error={formErrors.borrower_info?.address?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residency_status">Residency Status *</Label>
                    <Controller
                      name="borrower_info.residency_status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select residency status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="permanent">Permanent</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_of_residency">Years of Residency</Label>
                    <Controller
                      name="borrower_info.years_of_residency"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="years_of_residency"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guarantor_category">Guarantor Category</Label>
                    <Controller
                      name="borrower_info.guarantor_category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select guarantor strength" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strong">Strong</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="weak">Weak</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Business Data Tab */}
              <TabsContent value="business" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Controller
                      name="business_data.business_name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="business_name"
                          placeholder="Enter business name"
                          error={formErrors.business_data?.business_name?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type *</Label>
                    <Controller
                      name="business_data.business_type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller_type">Seller Type</Label>
                    <Controller
                      name="business_data.seller_type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select seller type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                            <SelectItem value="retailer">Retailer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_of_operation">Years of Operation</Label>
                    <Controller
                      name="business_data.years_of_operation"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="years_of_operation"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="average_daily_sales">Average Daily Sales (BDT)</Label>
                    <Controller
                      name="business_data.average_daily_sales"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="average_daily_sales"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_month_sales">Last Month Sales (BDT)</Label>
                    <Controller
                      name="business_data.last_month_sales"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="last_month_sales"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory_value">Current Inventory Value (BDT)</Label>
                    <Controller
                      name="business_data.inventory_value_present"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="inventory_value"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_expense">Total Monthly Expenses (BDT)</Label>
                    <Controller
                      name="business_data.total_expense_last_month"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="total_expense"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personal_expense">Personal Monthly Expenses (BDT)</Label>
                    <Controller
                      name="business_data.personal_expense"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="personal_expense"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rent_advance">Rent Advance (BDT)</Label>
                    <Controller
                      name="business_data.rent_advance"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="rent_advance"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Financial Data Tab */}
              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_income">Monthly Income (BDT)</Label>
                    <Controller
                      name="financial_data.monthly_income"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="monthly_income"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_volume">Bank Transaction Volume (1 Year - BDT)</Label>
                    <Controller
                      name="financial_data.bank_transaction_volume_1y"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="bank_volume"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mfs_volume">MFS Transaction Volume (Monthly - BDT)</Label>
                    <Controller
                      name="financial_data.mfs_transaction_volume_monthly"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="mfs_volume"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_assets">Total Assets (BDT)</Label>
                    <Controller
                      name="financial_data.total_assets"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="total_assets"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Existing Loans Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Existing Loans</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLoan}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Loan
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No existing loans added</p>
                      <p className="text-sm">Click "Add Loan" to include existing loan information</p>
                    </div>
                  )}

                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline">Loan #{index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Financial Institution Name *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.fi_name`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Enter FI name"
                                error={formErrors.financial_data?.existing_loans?.[index]?.fi_name?.message}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>FI Type *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.fi_type`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select FI type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fiTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Loan Amount (BDT) *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.loan_amount`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                placeholder="0"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Outstanding Amount (BDT) *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.outstanding_loan`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                placeholder="0"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Monthly Installment (BDT) *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.monthly_installment`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                placeholder="0"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Repaid Percentage (%) *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.repaid_percentage`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Repayment Status *</Label>
                          <Controller
                            name={`financial_data.existing_loans.${index}.repayment_status`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select repayment status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {repaymentStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Loan Details Tab */}
              <TabsContent value="loan" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount_requested">Loan Amount Requested (BDT)</Label>
                    <Controller
                      name="loan_details.amount_requested"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="amount_requested"
                          type="number"
                          min="1"
                          placeholder="0"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="loan_purpose">Loan Purpose</Label>
                    <Controller
                      name="loan_details.purpose"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="loan_purpose"
                          placeholder="Describe the purpose of the loan"
                          rows={4}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Application Summary */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Application Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Borrower:</strong> {watchedFields.borrower_info?.full_name || 'Not provided'}
                      </div>
                      <div>
                        <strong>Business:</strong> {watchedFields.business_data?.business_name || 'Not provided'}
                      </div>
                      <div>
                        <strong>Business Type:</strong> {watchedFields.business_data?.business_type || 'Not selected'}
                      </div>
                      <div>
                        <strong>Monthly Income:</strong> {
                          watchedFields.financial_data?.monthly_income 
                            ? formatCurrency(watchedFields.financial_data.monthly_income)
                            : 'Not provided'
                        }
                      </div>
                      <div>
                        <strong>Existing Loans:</strong> {fields.length} loan(s)
                      </div>
                      <div>
                        <strong>Requested Amount:</strong> {
                          watchedFields.loan_details?.amount_requested 
                            ? formatCurrency(watchedFields.loan_details.amount_requested)
                            : 'Not specified'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-2">
                {activeTab !== 'borrower' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ['borrower', 'business', 'financial', 'loan'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {activeTab !== 'loan' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ['borrower', 'business', 'financial', 'loan'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Next
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="min-w-[120px]"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};