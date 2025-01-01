import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

interface SpeedLineChartProps {
  agvDataArray: {
    car_id: number;
    agv_speed: number;
    time_stamp: string;
  }[];
}

export function SpeedLineChart({ agvDataArray }: SpeedLineChartProps) {
  const [chartData, setChartData] = useState<
    { timestamp: string; time: number; [key: string]: number | string }[]
  >([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  useEffect(() => {
    if (agvDataArray.length === 0) return;

    // Dynamically build chart configuration
    const newConfig: ChartConfig = {};
    const newDataPoints = agvDataArray.map((agv) => {
      const key = `agv${agv.car_id}`;
      
      // Configure color and label for each AGV if not already set
      if (!newConfig[key]) {
        newConfig[key] = {
          label: `AGV ${agv.car_id}`,
          color: `hsl(${(agv.car_id * 100) % 360}, 70%, 50%)`, // Generate unique color
        };
      }

      return {
        timestamp: agv.time_stamp,
        time: new Date(agv.time_stamp).getTime(),
        [key]: agv.agv_speed,
      };
    });

    // Update chart data while maintaining time window
    setChartData((prevData) => {
      const now = Date.now();
      const timeWindow = 5000; // 5 seconds window

      // Combine existing and new data points
      const mergedData = [...prevData];
      newDataPoints.forEach((newPoint) => {
        const existingIndex = mergedData.findIndex(
          (point) => point.time === newPoint.time
        );
        if (existingIndex >= 0) {
          mergedData[existingIndex] = { ...mergedData[existingIndex], ...newPoint };
        } else {
          mergedData.push(newPoint);
        }
      });

      // Filter data points within time window and sort by time
      return mergedData
        .filter((point) => now - point.time <= timeWindow)
        .sort((a, b) => a.time - b.time);
    });

    setChartConfig(newConfig);
  }, [agvDataArray]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speed Line Chart - Multiple AGVs</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-72 w-full">
          <LineChart
            data={chartData}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={chartConfig[key].color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false} // Disable animation for real-time updates
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
