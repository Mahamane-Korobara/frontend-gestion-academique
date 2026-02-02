// src/components/dashboard/DashboardSection.jsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardSection({ title, description, children, mobileContent, icon: Icon, action }) {
  return (
    <Card className="border border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-gray-500" />}
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          {action}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Contenu principal (Desktop/Flexible) */}
        {children}

        {/* Pied de carte mobile avec Sheet si mobileContent est fourni */}
        {mobileContent && (
          <div className="lg:hidden mt-4 pt-3 border-t">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full text-xs h-9">
                  Voir tout l'historique
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-125 overflow-y-auto">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle>{title}</SheetTitle>
                  <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                {mobileContent}
              </SheetContent>
            </Sheet>
          </div>
        )}
      </CardContent>
    </Card>
  );
}