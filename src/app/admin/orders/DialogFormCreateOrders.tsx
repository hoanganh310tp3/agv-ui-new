"use client";

import { MapDrawer } from "@/app/layout/MapDrawer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { createOrder } from "@/services/APIs/orders.apiServices";
import { CreateOrderDto } from "@/types/Order.types";
import { loadNames, loadNamesEnum } from "@/utils/arraysUsedOften";
import {
  convertDateToString,
  convertStringToNumber,
  isEndPointWithinRange,
  isLoadAmountWithinRange,
  isLoadWeightWithinRange,
  isOrderIdWithinRange,
  isStartPointWithinRange,
  MAX_END_POINT_VALUE,
  MAX_LOAD_AMOUNT_VALUE,
  MAX_LOAD_WEIGHT_VALUE,
  MAX_ORDER_ID_VALUE,
  MAX_START_POINT_VALUE,
  MIN_END_POINT_VALUE,
  MIN_LOAD_AMOUNT_VALUE,
  MIN_LOAD_WEIGHT_VALUE,
  MIN_ORDER_ID_VALUE,
  MIN_START_POINT_VALUE,
} from "@/utils/conversionUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, startOfDay } from "date-fns";
import { CirclePlus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// import { vi } from "date-fns/locale";

// Generate weight mapping dynamically
// Define the weightMapping with an explicit type
const weightMapping: { [key: string]: number } = loadNames.reduce(
  (acc, loadName, index) => {
    acc[loadName] = index + 1;
    return acc;
  },
  {} as { [key: string]: number },
);

const formSchema = z.object({
  order_number: z
    .string()
    .min(1)
    .regex(/^\d+$/, { message: "Must be integer" })
    .refine((value) => isOrderIdWithinRange(convertStringToNumber(value)), {
      message: `Number should be between ${MIN_ORDER_ID_VALUE} and ${MAX_ORDER_ID_VALUE}.`,
    }),
  order_date: z.date({
    required_error: "Order Date is empty.",
  }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: "Time must be in 23h format hh:mm:ss",
  }),
  start_point: z
    .string()
    .min(1)
    .regex(/^\d+$/, { message: "Must be integer" })
    .refine((value) => isStartPointWithinRange(convertStringToNumber(value)), {
      message: `Number should be between ${MIN_START_POINT_VALUE} and ${MAX_START_POINT_VALUE}.`,
    }),
  end_point: z
    .string()
    .min(1)
    .regex(/^\d+$/, { message: "Must be integer" })
    .refine((value) => isEndPointWithinRange(convertStringToNumber(value)), {
      message: `Number should be between ${MIN_END_POINT_VALUE} and ${MAX_END_POINT_VALUE}.`,
    }),
  load_name: z
    .string()
    .transform((val) => val.toLowerCase())
    .refine((val) => loadNamesEnum.includes(val), {
      message: `Load name must be one of: ${loadNames.join(", ")}.`,
    }),
  load_amount: z
    .string()
    .min(1)
    .regex(/^\d*$/, "Numerical characters only.")
    .refine((value) => isLoadAmountWithinRange(convertStringToNumber(value)), {
      message: `Number should be between ${MIN_LOAD_AMOUNT_VALUE} and ${MAX_LOAD_AMOUNT_VALUE}.`,
    }),
  load_weight: z
    .string()
    .min(1)
    .regex(/^\d*$/, "Numerical characters only.")
    .refine((value) => isLoadWeightWithinRange(convertStringToNumber(value)), {
      message: `Number should be between ${MIN_LOAD_WEIGHT_VALUE} and ${MAX_LOAD_WEIGHT_VALUE}.`,
    }),
  user_name: z.string(),
});

interface FormCreateOrdersProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  fetchListData: () => void;
}

export function DialogFormCreateOrders({
  isDialogOpen,
  setIsDialogOpen,
  fetchListData,
}: FormCreateOrdersProps) {
  const { toast } = useToast();
  const { account } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_number: "",
      order_date: new Date(),
      start_time: "",
      start_point: "",
      end_point: "",
      load_name: "",
      load_amount: "",
      load_weight: "",
      user_name: account.name,
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const createDto: CreateOrderDto = {
      order_number: convertStringToNumber(values.order_number),
      order_date: convertDateToString(values.order_date),
      start_time: values.start_time,
      start_point: convertStringToNumber(values.start_point),
      end_point: convertStringToNumber(values.end_point),
      load_name: values.load_name.toLowerCase(),
      load_amount: convertStringToNumber(values.load_amount),
      load_weight: convertStringToNumber(values.load_weight),
      user_name: values.user_name,
    };

    try {
      const data = await createOrder(createDto);
      if (data) {
        console.log("data", data);
        toast({
          title: "Order created successfully",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(data, null, 2)}
              </code>
            </pre>
          ),
        });
        fetchListData();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.log("Error creating order:", error);
      toast({
        title: "Order creation failed",
        description: "That order_id already exist.",
      });
    }
  }

  const { setValue, watch } = form;

  // Watch for changes to load_name and load_amount
  const loadName = watch("load_name");
  const loadAmount = watch("load_amount");

  useEffect(() => {
    // Parse load_amount as a number
    const amount = parseInt(loadAmount || "0", 10);
    const weightPerUnit = weightMapping[loadName.toLowerCase()] || 0;
    const calculatedWeight = amount * weightPerUnit;

    // Update load_weight field
    setValue("load_weight", calculatedWeight.toString());
  }, [loadName, loadAmount, setValue]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <CirclePlus />
          Create order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] min-w-[80vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new order</DialogTitle>
          <DialogDescription>Add inputs for your AGV here.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="order_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter integer from 1 to 999"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique number you assign to this order.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // Disable past dates by setting the minimum date to today
                          disabled={(date) => date < startOfDay(new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Date (yyyy-MM-dd) you expect AGVs to perform this order.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter in format HH:mm:ss"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Timestamp of the Order Date you selected that you expect
                      AGVs to perform this order.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Point</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter integer from ${MIN_START_POINT_VALUE} to ${MAX_START_POINT_VALUE}`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Start point of this order's route.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Point</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter integer from ${MIN_END_POINT_VALUE} to ${MAX_END_POINT_VALUE}`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      End point of this order's route.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="load_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load Name</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter load name`} {...field} />
                    </FormControl>
                    <FormDescription>
                      Material type of the load.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="load_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter integer from ${MIN_LOAD_AMOUNT_VALUE} to ${MAX_LOAD_AMOUNT_VALUE}`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Number of load units.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="load_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load Weight</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        placeholder={`Read-only field...`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Calculated total weight of load.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        placeholder={`Read-only field...`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      User that sent this order.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-x-5">
              <Button type="submit" disabled={!form.formState.isValid}>
                Submit
              </Button>
              <MapDrawer />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}