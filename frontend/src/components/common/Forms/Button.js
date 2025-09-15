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
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background', {
    variants: {
        variant: {
            default: 'bg-blue-600 text-white hover:bg-blue-700',
            destructive: 'bg-red-600 text-white hover:bg-red-700',
            outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
            ghost: 'hover:bg-gray-100 text-gray-900',
            link: 'underline-offset-4 hover:underline text-blue-600',
        },
        size: {
            default: 'h-10 py-2 px-4',
            sm: 'h-9 px-3 rounded-md',
            lg: 'h-11 px-8 rounded-md',
            icon: 'h-10 w-10',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
const Button = React.forwardRef((_a, ref) => {
    var { className, variant, size, loading, children, disabled } = _a, props = __rest(_a, ["className", "variant", "size", "loading", "children", "disabled"]);
    return (_jsxs("button", Object.assign({ className: cn(buttonVariants({ variant, size, className })), ref: ref, disabled: disabled || loading }, props, { children: [loading && (_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-4 w-4", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), children] })));
});
Button.displayName = 'Button';
export { Button, buttonVariants };
