
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LinkIcon } from "lucide-react";

interface AnalyticsTabProps {
  mockAnalyticsData: {
    weeklyViews: number[];
    topLinks: { name: string; clicks: number }[];
    referrers: { name: string; count: number }[];
  };
}

const AnalyticsTab = ({ mockAnalyticsData }: AnalyticsTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your profile performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Profile Views</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {/* Placeholder for chart */}
            <div className="h-full border-2 rounded-md border-dashed flex items-center justify-center">
              <p className="text-muted-foreground">Weekly views chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.topLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <LinkIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{link.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold">{link.clicks}</span>
                    <span className="text-muted-foreground ml-1">clicks</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.referrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{referrer.name}</span>
                  <div className="flex items-center">
                    <span className="font-bold">{referrer.count}</span>
                    <span className="text-muted-foreground ml-1">visits</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Visitor Locations</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {/* Placeholder for map */}
            <div className="h-full border-2 rounded-md border-dashed flex items-center justify-center">
              <p className="text-muted-foreground">Location map will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
