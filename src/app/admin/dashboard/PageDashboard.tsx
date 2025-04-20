import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { WebSocketData } from "@/types/WebSocket.types";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { columnsTableDashboard } from "./columnsTableDashboard";
import { SpeedLineChart } from "./SpeedLineChart";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function PageDashboard() {
  const [agvDataMap, setAgvDataMap] = useState<Record<number, WebSocketData>>({});
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (paused) return;

    const ws = new WebSocket("ws://localhost:8000/ws/agv_data/");

    ws.onopen = () => {
      console.log("Connected to AGV data websocket");
      ws.send("get_data");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastUpdated(new Date());
        
        if (Array.isArray(data)) {
          const newAgvDataMap: Record<number, WebSocketData> = {};
          data.forEach((item) => {
            if (item && typeof item.car_id === 'number') {
              newAgvDataMap[item.car_id] = {
                car_id: item.car_id,
                agv_state: item.agv_state,
                agv_speed: item.agv_speed,
                agv_battery: item.agv_battery,
                previous_waypoint: item.previous_waypoint,
                next_waypoint: item.next_waypoint,
                time_stamp: item.time_stamp,
                distance_sum: item.distance_sum,
                distance: item.distance,
              };
            }
          });
          
          if (Object.keys(newAgvDataMap).length > 0) {
            setAgvDataMap(newAgvDataMap);
          }
        }
      } catch (error) {
        console.error("Error parsing websocket data:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [paused]);

  const agvDataArray = Object.values(agvDataMap);

  return (
    <div>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPaused((prev) => !prev)}>
              {paused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume Updates
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Updates
                </>
              )}
            </Button>
          </div>
        </div>
        
        <SpeedLineChart agvDataArray={agvDataArray} />
        
        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={agvDataArray}
              columns={columnsTableDashboard}
              filterSearchByColumn="car_id"
            />
          </CardContent>
          {lastUpdated && (
            <CardFooter className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
