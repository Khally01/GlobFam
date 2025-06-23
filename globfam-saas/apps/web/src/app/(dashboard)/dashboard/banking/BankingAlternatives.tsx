'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/shared-ui';
import { Upload, FileSpreadsheet, PlusCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BankingAlternatives() {
  const router = useRouter();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Alternative Ways to Add Transactions</CardTitle>
        <CardDescription>
          While direct bank connections are being implemented, you can use these methods:
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
             onClick={() => router.push('/dashboard/transactions')}>
          <FileSpreadsheet className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Import CSV/Excel</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Export transactions from your bank and import them in bulk
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Go to Import
          </Button>
        </div>

        <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
             onClick={() => router.push('/dashboard/transactions')}>
          <PlusCircle className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Manual Entry</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Add transactions one by one with full control
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Add Transaction
          </Button>
        </div>

        <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
             onClick={() => router.push('/dashboard/transactions')}>
          <TrendingUp className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-2">AI Categorization</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Import first, then use AI to auto-categorize
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}