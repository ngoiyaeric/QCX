import { DeepPartial } from 'ai'
import { z } from 'zod'

export const nextActionSchema = z.object({
  reasoning: z.string().describe('Your reasoning for the decision'),
  next: z.enum(['inquire', 'proceed'])
})

export type NextAction = DeepPartial<typeof nextActionSchema>