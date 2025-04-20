import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface SpeedLineChartProps {
  agvDataArray: {
    car_id: number;
    agv_speed: number;
    time_stamp: string;
  }[];
}

export function SpeedLineChart({ agvDataArray }: SpeedLineChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  // Tạo dữ liệu lịch sử để vẽ đồ thị
  useEffect(() => {
    if (!agvDataArray.length) return;

    // Tạo cấu hình chart cho mỗi AGV
    const newConfig: ChartConfig = {};
    agvDataArray.forEach(agv => {
      const key = `agv${agv.car_id}`;
      newConfig[key] = {
        label: `AGV ${agv.car_id}`,
        color: `hsl(${(agv.car_id * 100) % 360}, 70%, 50%)`,
      };
    });
    setChartConfig(newConfig);

    // Bây giờ thêm dữ liệu hiện tại vào chart
    setChartData(prevData => {
      // Tạo điểm dữ liệu mới với timestamp hiện tại
      const now = new Date().toISOString();
      const newPoint: any = { 
        timestamp: now,
        formattedTime: new Date().toLocaleTimeString()
      };
      
      // Thêm dữ liệu của mỗi AGV vào điểm dữ liệu
      agvDataArray.forEach(agv => {
        newPoint[`agv${agv.car_id}`] = agv.agv_speed;
      });
      
      // Thêm điểm mới vào dữ liệu trước đó
      const updatedData = [...prevData, newPoint];
      
      // Giới hạn số lượng điểm dữ liệu (giữ 20 điểm gần nhất)
      if (updatedData.length > 20) {
        return updatedData.slice(updatedData.length - 20);
      }
      
      return updatedData;
    });
  }, [agvDataArray]);

  if (agvDataArray.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speed Line Chart - Multiple AGVs</CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <p className="text-muted-foreground">Waiting for AGV data...</p>
        </CardContent>
      </Card>
    );
  }

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
              dataKey="formattedTime" 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={[0, 'auto']}
              label={{ value: 'Speed (m/s)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                dataKey={key}
                name={chartConfig[key].label}
                type="monotone"
                stroke={chartConfig[key].color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
