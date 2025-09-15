var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
const Select = forwardRef((_a, ref) => {
    var { className, error, label, helperText, options } = _a, props = __rest(_a, ["className", "error", "label", "helperText", "options"]);
    return (_jsxs("div", { className: "space-y-2", children: [label && (_jsx("label", { className: "text-sm font-medium text-gray-700", children: label })), _jsxs("div", { className: "relative", children: [_jsx("select", Object.assign({ className: cn('flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50', error && 'border-red-500 focus:ring-red-500', className), ref: ref }, props, { children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })), _jsx(ChevronDown, { className: "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" })] }), error && (_jsx("p", { className: "text-sm text-red-600", children: error })), helperText && !error && (_jsx("p", { className: "text-sm text-gray-600", children: helperText }))] }));
});
Select.displayName = 'Select';
export { Select };
