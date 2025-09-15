import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Eye, Trash2, Download } from 'lucide-react';
import { cn } from '../../../utils/cn';
export const ActionMenu = ({ items, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { className: cn('relative', className), ref: menuRef, children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), className: "p-1 hover:bg-gray-100 rounded-md transition-colors", children: _jsx(MoreVertical, { className: "h-4 w-4 text-gray-500" }) }), isOpen && (_jsx("div", { className: "absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10", children: _jsx("div", { className: "py-1", children: items.map((item) => (_jsxs("button", { onClick: () => {
                            item.onClick();
                            setIsOpen(false);
                        }, disabled: item.disabled, className: cn('flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed', item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'), children: [item.icon && _jsx("span", { className: "mr-3", children: item.icon }), item.label] }, item.key))) }) }))] }));
};
// Common action menu items
export const getCommonActions = (record) => ({
    view: {
        key: 'view',
        label: 'View Details',
        icon: _jsx(Eye, { className: "h-4 w-4" }),
        onClick: () => console.log('View', record),
    },
    edit: {
        key: 'edit',
        label: 'Edit',
        icon: _jsx(Edit, { className: "h-4 w-4" }),
        onClick: () => console.log('Edit', record),
    },
    download: {
        key: 'download',
        label: 'Download',
        icon: _jsx(Download, { className: "h-4 w-4" }),
        onClick: () => console.log('Download', record),
    },
    delete: {
        key: 'delete',
        label: 'Delete',
        icon: _jsx(Trash2, { className: "h-4 w-4" }),
        onClick: () => console.log('Delete', record),
        danger: true,
    },
});
