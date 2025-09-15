import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Button } from '../Forms/Button';
import { Input } from '../Forms/Input';
export function DataTable({ columns, data, loading = false, pagination, rowKey = 'id', onRow, className, searchable = false, onSearch, filters, }) {
    const [sortConfig, setSortConfig] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const handleSort = (columnKey) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnKey, direction });
    };
    const handleSearch = (value) => {
        setSearchTerm(value);
        onSearch === null || onSearch === void 0 ? void 0 : onSearch(value);
    };
    const getRowKey = (record, index) => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        return record[rowKey] || index.toString();
    };
    const renderCell = (column, record, index) => {
        const value = record[column.dataIndex];
        if (column.render) {
            return column.render(value, record, index);
        }
        return value;
    };
    const getSortIcon = (columnKey) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ? (_jsx(ChevronUp, { className: "h-4 w-4" })) : (_jsx(ChevronDown, { className: "h-4 w-4" }));
    };
    return (_jsxs("div", { className: cn('space-y-4', className), children: [(searchable || filters) && (_jsx("div", { className: "flex items-center justify-between gap-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [searchable && (_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search...", value: searchTerm, onChange: (e) => handleSearch(e.target.value), className: "pl-10 w-64" })] })), filters && (_jsxs(Button, { variant: "outline", onClick: () => setShowFilters(!showFilters), className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-4 w-4" }), "Filters"] }))] }) })), showFilters && filters && (_jsx("div", { className: "bg-gray-50 p-4 rounded-lg border", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: filters.map((filter) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: filter.label }), _jsxs("select", { value: filter.value || '', onChange: (e) => filter.onChange(e.target.value), className: "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "All" }), filter.options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }, filter.key))) }) })), _jsx("div", { className: "overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { scope: "col", className: cn('px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right', column.sortable && 'cursor-pointer hover:bg-gray-100'), style: { width: column.width }, onClick: () => column.sortable && handleSort(column.key), children: _jsxs("div", { className: "flex items-center gap-1", children: [column.title, column.sortable && getSortIcon(column.key)] }) }, column.key))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-6 py-4 text-center", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading..." })] }) }) })) : data.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-6 py-8 text-center text-gray-500", children: "No data available" }) })) : (data.map((record, index) => {
                                    const rowProps = onRow ? onRow(record, index) : {};
                                    return (_jsx("tr", Object.assign({ className: "hover:bg-gray-50" }, rowProps, { children: columns.map((column) => (_jsx("td", { className: cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right'), children: renderCell(column, record, index) }, `${getRowKey(record, index)}-${column.key}`))) }), getRowKey(record, index)));
                                })) })] }) }) }), pagination && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-700", children: ["Showing ", ((pagination.current - 1) * pagination.pageSize) + 1, " to", ' ', Math.min(pagination.current * pagination.pageSize, pagination.total), " of", ' ', pagination.total, " results"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => pagination.onChange(pagination.current - 1, pagination.pageSize), disabled: pagination.current <= 1, children: "Previous" }), _jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) })
                                    .slice(Math.max(0, pagination.current - 3), Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.current + 2))
                                    .map((_, index) => {
                                    const pageNumber = Math.max(0, pagination.current - 3) + index + 1;
                                    return (_jsx(Button, { variant: pageNumber === pagination.current ? 'default' : 'outline', size: "sm", onClick: () => pagination.onChange(pageNumber, pagination.pageSize), children: pageNumber }, pageNumber));
                                }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => pagination.onChange(pagination.current + 1, pagination.pageSize), disabled: pagination.current >= Math.ceil(pagination.total / pagination.pageSize), children: "Next" })] })] }))] }));
}
