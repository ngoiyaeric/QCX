<div align="center">

#  Quality 🌍 Computer 🌏 Experiences

<img src="https://github.com/user-attachments/assets/3fef4c71-2811-4853-80b2-2703ee2eda78" alt="Logo" width="200"/>

[**Sign Up**](https://tally.so/r/wkWqkd) &nbsp;|&nbsp; [**Community**](https://discord.com/invite/NqGY9EWjWj) &nbsp;|&nbsp; [**X**](https://x.com/tryqcx)

</div>
### Language to Maps 
(in progress)

<img width="1277" alt="Screen Shot 2024-06-18 at 4 27 51 PM" src="https://github.com/QueueLab/MapGPT/assets/115367894/01584e12-b3f5-41c9-8009-a16642568798">



## Contributing

Welcome! Please see the issues for items that need attention, and below for some tools to aid in development and debugging. We're working to interpolate chat functionality onto the map module.


Visit our roadmap for more information.

(https://draw.roadmap.sh/664d9e21d6b907c7f745be36)

Documentation: 

https://chlorinated-birch-096.notion.site/MapGPT-Documentation-f7440889fca74582b31376192a30ed94

### Running the app on your own machine


## Stack

- App framework: [Next.js](https://nextjs.org/)
- Text streaming / Generative UI: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- Generative Model: [OpenAI](https://openai.com/)
- Search API: [Tavily AI](https://tavily.com/) / [Exa AI](https://exa.ai/)
- Serverless Database: [Upstash](https://upstash.com/)
- Component library: [shadcn/ui](https://ui.shadcn.com/)
- Headless component primitives: [Radix UI](https://www.radix-ui.com/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)


### 2. Install dependencies

```
cd mapgpt
bun install
```

### 3. Setting up Upstash Redis

Follow the guide below to set up Upstash Redis. Create a database and obtain `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Refer to the [Upstash guide](https://upstash.com/blog/rag-chatbot-upstash#setting-up-upstash-redis) for instructions on how to proceed.

### 4. Fill out secrets

```
cp .env.local.example .env.local
```

Your .env.local file should look like this:

```
# OpenAI API key retrieved here: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Tavily API Key retrieved here: https://app.tavily.com/home
TAVILY_API_KEY=

# Upstash Redis URL and Token retrieved here: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

#Mapbox access token
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=



_Note: This project focuses on Generative UI and requires complex output from LLMs. Currently, it's assumed that the official OpenAI models will be used. Although it's possible to set up other models, if you use an OpenAI-compatible model, but we don't guarantee that it'll work._

### 5. Run app locally

```
bun dev
```

You can now visit http://localhost:3000.

## Verified models

List of verified models that can be specified to writers.

- [Groq](https://console.groq.com/docs/models)
  - LLaMA3 8b
  - LLaMA3 70b
 - Grok (coming soon) 
