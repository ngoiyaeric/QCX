<<<<<<< HEAD
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Skip middleware for server actions to avoid breaking them
  if (request.headers.get('next-action')) {
    return NextResponse.next()
  }

  // Example: Check if the user is authenticated for protected routes
  const isAuthenticated = true // Replace with actual auth check

  // If the request is for the settings page and the user is not authenticated
  if (request.nextUrl.pathname.startsWith("/settings") && !isAuthenticated) {
    // Redirect to the login page
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
=======
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
>>>>>>> origin/main
