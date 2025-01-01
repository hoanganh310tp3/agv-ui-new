import { Button } from "@/components/ui/button"; // Import a button component for toggling pause
import { DataTable } from "@/components/ui/data-table";
import { WebSocketData } from "@/types/WebSocket.types";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { columnsTableDashboard } from "./columnsTableDashboard";
import { SpeedLineChart } from "./SpeedLineChart";

export function PageDashboard() {
  const [agvDataMap, setAgvDataMap] = useState<Record<number, WebSocketData>>({});
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/agv_data/");

    ws.onopen = () => {
      console.log("Connected to AGV data websocket");
      ws.send("get_data");
    };

    ws.onmessage = (event) => {
      if (paused) return;

      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          const newAgvDataMap: Record<number, WebSocketData> = {};
          data.forEach((item) => {
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
          });
          setAgvDataMap(newAgvDataMap);
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
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <Button variant="outline" onClick={() => setPaused((prev) => !prev)}>
          {paused ? (
            <>
              <Play />
              Resume Updates
            </>
          ) : (
            <>
              <Pause />
              Pause Updates
            </>
          )}
        </Button>
        <SpeedLineChart agvDataArray={agvDataArray} />
        <DataTable
          data={agvDataArray}
          columns={columnsTableDashboard}
          filterSearchByColumn="car_id"
        />
      </div>
    </div>
  );
}
