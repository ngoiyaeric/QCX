// middleware.ts (or middleware.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for a server action
  if (request.headers.get('next-action')) {
    console.log('Server action request detected, bypassing custom middleware logic.');
    return NextResponse.next(); // Pass through without further middleware processing
  }

  // Your existing middleware logic here
  console.log(`Applying standard middleware logic to: ${request.nextUrl.pathname}`);
  // Example: Add a custom header to other requests
  // const response = NextResponse.next();
  // response.headers.set('X-Custom-Header', 'Processed by middleware');
  // return response;

  return NextResponse.next();
}

// Optional: Configure your middleware matcher as needed
// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };
