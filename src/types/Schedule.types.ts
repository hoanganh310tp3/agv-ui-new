import { z } from "zod";

export const CreateScheduleZod = z.object({
  order_number: z.number(),
  order_date: z.string(),
  load_name: z.string(),
  load_weight: z.number(),
  load_amount: z.number(),
  agv_id: z.number(),
  est_energy: z.number(),
  est_distance: z.number(),
  est_start_time: z.string(),
  est_end_time: z.string(),
  start_point: z.number(),
  end_point: z.number(),
  is_processed: z.boolean(),
  instruction_set: z.any()
});

export type CreateScheduleDto = z.infer<typeof CreateScheduleZod>;

export interface Schedule extends CreateScheduleDto {
  schedule_id: number;
}