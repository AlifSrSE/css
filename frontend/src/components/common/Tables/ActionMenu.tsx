import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Eye, Trash2, Download } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ActionMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={cn(
                  'flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                )}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Common action menu items
export const getCommonActions = (record: any) => ({
  view: {
    key: 'view',
    label: 'View Details',
    icon: <Eye className="h-4 w-4" />,
    onClick: () => console.log('View', record),
  },
  edit: {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => console.log('Edit', record),
  },
  download: {
    key: 'download',
    label: 'Download',
    icon: <Download className="h-4 w-4" />,
    onClick: () => console.log('Download', record),
  },
  delete: {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => console.log('Delete', record),
    danger: true,
  },
});