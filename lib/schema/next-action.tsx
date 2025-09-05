import { DeepPartial } from 'ai'
import { z } from 'zod'

export const nextActionSchema = z.object({
   reasoning: z.string().max(200).describe('Your reasoning for the decision (1–2 sentences)'),
   next: z.enum(['inquire', 'proceed'])
})
export type NextAction = DeepPartial<typeof nextActionSchema>
