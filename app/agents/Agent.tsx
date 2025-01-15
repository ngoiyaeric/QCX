import { PartialInquiry, inquirySchema } from '@/lib/schema/inquiry'
// import { getModel } from '../utils'
import { streamObject } from 'ai'
import { BaseAgent } from './base-agent'
import { Copilot } from '@/components/copilot'
import { createStreamableValue } from '@/lib/streamable-value'
class InquiryAgent extends BaseAgent {
  async execute(): Promise<PartialInquiry> {
    const objectStream = createStreamableValue<PartialInquiry>()
    this.uiStream.append(<Copilot inquiry={objectStream.value} />)

    let finalInquiry: PartialInquiry = {}
    await streamObject({
      model: getModel(),
      system: `Your system prompt here`,
      messages: this.messages,
      schema: inquirySchema
    })
      .then(async result => {
        for await (const obj of result.partialObjectStream) {
          if (obj) {
            objectStream.update(obj)
            finalInquiry = obj
          }
        }
      })
      .finally(() => {
        objectStream.done()
      })

    return finalInquiry
  }
}

class LandUseAgent extends BaseAgent {
  async execute(): Promise<any> {
    // Implement land use workflow
    return {}
  }
}

class EnvironmentAwareQueryAgent extends BaseAgent {
  async execute(): Promise<any> {
    // Implement environment-aware query workflow
    return {}
  }
}

export { InquiryAgent, LandUseAgent, EnvironmentAwareQueryAgent }
