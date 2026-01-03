
'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContextMenuProps {
  children: React.ReactElement;
  menuItems: ReactNode;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ children, menuItems }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setPosition({ x: event.clientX, y: event.clientY });
      setOpen(true);
    },
    [setPosition, setOpen]
  );
  
  const contentStyle = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onContextMenu={handleContextMenu}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent style={contentStyle} className="w-56" alignOffset={5}>
        {menuItems}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContextMenu;
