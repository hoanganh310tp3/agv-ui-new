import { format } from "date-fns";
import { z } from "zod";

export const CreateOrderZod = z.object({
  order_number: z.preprocess( // Đổi từ order_id thành order_number
    (order_number) => parseInt(order_number as string, 10),
    z.number(),
  ),
  load_name: z.string(),
  load_amount: z.preprocess(
    (load_amount) => parseFloat(load_amount as string),
    z.number(),
  ),
  load_weight: z.preprocess(
    (load_weight) => parseFloat(load_weight as string),
    z.number(),
  ),
  start_point: z.preprocess(
    (start_point) => parseInt(start_point as string, 10),
    z.number(),
  ),
  end_point: z.preprocess(
    (end_point) => parseInt(end_point as string, 10),
    z.number(),
  ),
  start_time: z.string(),
  order_date: z.preprocess(
    (order_date) => format(order_date as Date, "yyyy-MM-dd"),
    z.string(),
  ),
  user_name: z.string(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderZod>;

export interface CreateOrderDto {
  order_number: number; // Đổi từ order_id thành order_number
  order_date: string;
  load_name: string;
  load_amount: number;
  load_weight: number;
  start_time: string;
  start_point: number;
  end_point: number;
  user_name: string;
}

export interface Order extends CreateOrderDto {
  request_id: number; // Thêm request_id từ database
}