import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
const SelectContext = createContext(undefined);
export const Select = ({ value, onValueChange, children }) => {
    const [open, setOpen] = useState(false);
    return (_jsx(SelectContext.Provider, { value: { value, onValueChange, open, setOpen }, children: _jsx("div", { className: "relative", children: children }) }));
};
export const SelectTrigger = ({ children, className }) => {
    const context = useContext(SelectContext);
    if (!context)
        throw new Error('SelectTrigger must be used within Select');
    return (_jsxs("button", { className: cn('flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50', className), onClick: () => context.setOpen(!context.open), children: [children, _jsx(ChevronDown, { className: "h-4 w-4 opacity-50" })] }));
};
export const SelectValue = ({ placeholder }) => {
    const context = useContext(SelectContext);
    if (!context)
        throw new Error('SelectValue must be used within Select');
    return _jsx("span", { children: context.value || placeholder });
};
export const SelectContent = ({ children, className }) => {
    const context = useContext(SelectContext);
    if (!context)
        throw new Error('SelectContent must be used within Select');
    if (!context.open)
        return null;
    return (_jsx("div", { className: cn('absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto', className), children: children }));
};
export const SelectItem = ({ value, children, className }) => {
    const context = useContext(SelectContext);
    if (!context)
        throw new Error('SelectItem must be used within Select');
    return (_jsx("div", { className: cn('px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 focus:bg-gray-100', context.value === value && 'bg-blue-50 text-blue-600', className), onClick: () => {
            context.onValueChange(value);
            context.setOpen(false);
        }, children: children }));
};
