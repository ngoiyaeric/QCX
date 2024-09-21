# MapGPT 
(In Progress) 

![1](https://github.com/user-attachments/assets/28d51f2d-3556-4508-89b1-7d1c9b0de70b)

>

## Overview

- [Features](#-features)
- [Stack](#-stack)
- [Quickstart](#-quickstart)
- [Deploy](#-deploy)
- [Search Engine](#-search-engine)
- [Verified models](#-verified-models)

## Features

Exploration & Automation

## Stack

- App framework: [Next.js](https://nextjs.org/)
- Map: [MapBox] (https://www.mapbox.com/)
- Location Data & News: 𝕏 
- Text streaming / Generative UI: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- Generative Model: [OpenAI](https://openai.com/)
- Search API: [Tavily AI](https://tavily.com/) / [Serper](https://serper.dev)
- Reader API: [Jina AI](https://jina.ai/)
- Serverless Database: [Upstash](https://upstash.com/)
- Component library: [shadcn/ui](https://ui.shadcn.com/)
- Headless component primitives: [Radix UI](https://www.radix-ui.com/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)


## Quickstart

### 1. Fork and Clone repo

Fork the repo to your Github account, then run the following command to clone the repo:

```
git clone git@github.com:[YOUR_GITHUB_ACCOUNT]/mapgpt.git
```

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

Upstash Vector store URL and Token retrieved here: https://console.upstash.com/vector
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
```

_Note: This project focuses on Generative UI and requires complex output from LLMs. Currently, it's assumed that the official OpenAI models will be used. Although it's possible to set up other models, if you use an OpenAI-compatible model, but we don't guarantee that it'll work._

### 5. Run app locally

```
bun dev
```

You can now visit http://localhost:3000.

## Deploy

Host your own live version of MapGPT with Vercel or Cloudflare Pages.

### Cloudflare Pages

1. Fork the repo to your GitHub.
2. Create a Cloudflare Pages project.
3. Select `mapgpt` repo and `Next.js` preset.
4. Set `OPENAI_API_KEY` and `TAVILY_API_KEY` env vars.
5. Save and deploy.
6. Cancel deployment, go to `Settings` -> `Functions` -> `Compatibility flags`, add `nodejs_compat` to preview and production.
7. Redeploy.


##  Search Engine

### Setting up the Search Engine in Your Browser

If you want to use MapGPT as a search engine in your browser, follow these steps:

1. Open your browser settings.
2. Navigate to the search engine settings section.
3. Select "Manage search engines and site search".
4. Under "Site search", click on "Add".
5. Fill in the fields as follows:
   - **Search engine**: mapgpt
   - **Shortcut**: mapgpt
   - **URL with %s in place of query**: `https://app.queue.cx/search?q=%s`
6. Click "Add" to save the new search engine.
7. Find "mapgpt" in the list of site search, click on the three dots next to it, and select "Make default".

This will allow you to use mapgpt as your default search engine in the browser.

## Verified models

### List of models applicable to all:
- OpenAI
  - gpt-4o
  - gpt-4-turbo
  - gpt-3.5-turbo
- Google
  - Gemini 1.5 pro (In Progress)
- Anthropic
  - Claude 3.5 Sonnet
- Ollama (Unstable)
  - mistral/openhermes & Phi3/llama3
  - Grok (In Progress) 
    

### List of verified models that can be specified to writers:

- [Groq](https://console.groq.com/docs/models)
  - LLaMA3 8b
  - LLaMA3 70b
  - Grok (In Progress) 
