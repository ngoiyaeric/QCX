import { upstash } from '@upstash/qstash'

class AgentCoordinator {
  private upstash: typeof upstash

  constructor() {
    this.upstash = upstash({ token: process.env.UPSTASH_TOKEN })
  }

  async executeWorkflow(workflowType: string, uiStream: ReturnType<typeof createStreamableUI>, messages: CoreMessage[]) {
    const agent = AgentFactory.createAgent(workflowType, uiStream, messages)
    const result = await agent.execute()

    // Store result in Upstash QStash for RAG
    await this.upstash.publishJSON({
      topic: 'agent-results',
      body: {
        workflowType,
        result,
        timestamp: new Date().toISOString(),
        location: messages.find(m => m.role === 'system')?.content // Assuming location is passed in system message
      }
    })

    return result
  }
}