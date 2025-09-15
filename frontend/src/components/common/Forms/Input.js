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
import { cn } from '../../../utils/cn';
const Input = forwardRef((_a, ref) => {
    var { className, type, error, label, helperText } = _a, props = __rest(_a, ["className", "type", "error", "label", "helperText"]);
    return (_jsxs("div", { className: "space-y-2", children: [label && (_jsx("label", { className: "text-sm font-medium text-gray-700", children: label })), _jsx("input", Object.assign({ type: type, className: cn('flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50', error && 'border-red-500 focus:ring-red-500', className), ref: ref }, props)), error && (_jsx("p", { className: "text-sm text-red-600", children: error })), helperText && !error && (_jsx("p", { className: "text-sm text-gray-600", children: helperText }))] }));
});
Input.displayName = 'Input';
export { Input };
