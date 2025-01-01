import { z } from "zod";

export const CreateLoginZod = z.object({
  email: z.string(),
  password: z.string(),
});

export type CreateLoginDto = z.infer<typeof CreateLoginZod>;

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  email: string;
  name: string;
  message: string;
}

export interface CreateRegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
}

export const CreateLogoutZod = z.object({
  email: z.string(),
  refresh_token: z.string(),
});

export type CreateLogoutDto = z.infer<typeof CreateLogoutZod>;

export interface LogoutResponse {
  message?: string;
  detail?: string;
}
