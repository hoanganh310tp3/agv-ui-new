import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createSchedule, getSchedules } from "@/services/APIs/schedules.apiServices";
import { Schedule } from "@/types/Schedule.types";
import { useEffect, useState } from "react";
import { columnsTableSchedules } from "./columnsTableSchedules";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";

export function PageSchedules() {
  const [listData, setListData] = useState<Schedule[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchListData = async () => {
    const data = await getSchedules();
    console.log(">>> data: ", data);
    setListData(data);
  };

  const handleCreateSchedule = async () => {
    try {
      setIsCreating(true);
      await createSchedule();
      toast.success("Schedule created successfully");
      await fetchListData(); // Refresh the list after creating
    } catch (error) {
      toast.error("Failed to create schedule");
      console.error("Error creating schedule:", error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchListData();
  }, []);

  return (
    <div>
      <div className="space-y-5">
        <h2 className="text-3xl font-bold">Schedules</h2>
        <Button 
          onClick={handleCreateSchedule} 
          disabled={isCreating}
          variant="secondary"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating Schedule..." : "Create Schedule"}
        </Button>
        <DataTable
          data={listData}
          columns={columnsTableSchedules}
          filterSearchByColumn="order_date"
        />
      </div>
    </div>
  );
}
