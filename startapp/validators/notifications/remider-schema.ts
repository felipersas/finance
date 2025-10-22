import { strings } from "@/constants/Strings";
import { z } from "zod";

export const ReminderSchema = z.object({
  title: z.string().min(1, { message: strings.validation.fieldRequired }),
  description: z.string().optional(),
  date: z
    .string()
    .min(1, { message: strings.validation.fieldRequired })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato: YYYY-MM-DD" }),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato: HH:mm" })
    .optional()
    .or(z.literal("")),
});

export type ReminderFormData = z.infer<typeof ReminderSchema>;
