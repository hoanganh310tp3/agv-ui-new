import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { deleteOrder, getOrders } from "@/services/APIs/orders.apiServices";
import { handleExportCSV } from "@/services/CSV/csvExportServices";
import { useCSVImport } from "@/services/CSV/useCSVImport";
import { Order } from "@/types/Order.types";
import { FileDown, FileUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { columnsTableOrders } from "./columnsTableOrders";
import { DialogFormCreateOrders } from "./DialogFormCreateOrders";
import { DialogInstructionsCSV } from "./DialogInstructionsCSV";

export function PageOrders() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [listData, setListData] = useState<Order[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { handleImportCSV } = useCSVImport();

  const fetchListData = async () => {
    const data = await getOrders();
    setListData(data);
  };

  const handleClickBtnDelete = async (request_id: number) => {
    console.log(">>> Deleting order with request_id:", request_id);
    
    if (!request_id) {
      toast.error("Invalid request ID");
      return;
    }
  
    try {
      await deleteOrder(request_id);
      toast.success("Order deleted successfully");
      await fetchListData(); // Refresh data after deletion
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order. Please try again.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportCSV(file, fetchListData).finally(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
    }
  };

  useEffect(() => {
    fetchListData();
  }, []);

  return (
    <>
      <div className="space-y-5">
        <h2 className="text-3xl font-bold">Orders</h2>
        <div className="space-x-5">
          <DialogFormCreateOrders
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            fetchListData={fetchListData}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <FileUp />
            Import CSV
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant={"secondary"}
            onClick={() => handleExportCSV(listData)}
          >
            <FileDown />
            Export CSV
          </Button>
          <DialogInstructionsCSV />
        </div>

        <DataTable
          data={listData}
          columns={columnsTableOrders(handleClickBtnDelete)}
          filterSearchByColumn="order_date"
        />
      </div>
    </>
  );
}
