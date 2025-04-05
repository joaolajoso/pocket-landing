
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatisticsCardsProps {
  profileViews: number;
  totalClicks: number;
}

const StatisticsCards = ({ profileViews, totalClicks }: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profileViews}</div>
          <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Link Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClicks}</div>
          <p className="text-xs text-muted-foreground mt-1">+5% from last week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">80%</div>
          <Progress value={80} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
