'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/shared-ui';
import { Sparkles, Brain, Calendar, TrendingDown, Bell, Shield } from 'lucide-react';

export default function SmartImportFeatures() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Transaction Management
        </CardTitle>
        <CardDescription>
          Upload your transactions and let our AI-powered system do the heavy lifting
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">AI Categorization</h4>
              <p className="text-sm text-muted-foreground">
                Automatically categorizes transactions based on merchant names and spending patterns
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Bill Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Identifies recurring bills and reminds you before due dates
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Spending Insights</h4>
              <p className="text-sm text-muted-foreground">
                Monthly spending breakdowns and unusual expense alerts
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Goal Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Alerts when you\'re close to achieving savings goals
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Secure Processing</h4>
              <p className="text-sm text-muted-foreground">
                All data is encrypted and processed securely on our servers
              </p>
            </div>
          </div>
          
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-sm font-medium">How it works:</p>
            <ol className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>1. Export CSV from your bank</li>
              <li>2. Upload to GlobFam</li>
              <li>3. AI categorizes instantly</li>
              <li>4. Review and confirm</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}