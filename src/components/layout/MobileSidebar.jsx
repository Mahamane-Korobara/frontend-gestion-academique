// src/components/layout/MobileSidebar.jsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import useUIStore from '@/lib/store/uiStore';

export default function MobileSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
      <SheetContent 
        side="left" 
        className="p-0 w-64 border-none flex flex-col h-dvh" // 100dvh est mieux pour mobile
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 h-full overflow-hidden">
          <Sidebar isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}