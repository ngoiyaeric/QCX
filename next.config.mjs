/** @type {import('next').NextConfig} */  
const nextConfig = {  
  experimental: {  
    serverActions: {  
      allowedOrigins: ["localhost:3000", "planet.queue.cx"]  
    },  
  },  
  // If you're using external packages in server components  
  serverComponentsExternalPackages: [  
    '@upstash/redis'  
  ]  
}  
  
export default nextConfig