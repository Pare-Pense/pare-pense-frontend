import { rewrite } from '@vercel/functions';

export const config = {
  matcher: '/api/:path*',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);

  const path = url.pathname.replace(/^\/api/, '');

  const backendUrl = process.env.BACKEND;

  return rewrite(`${backendUrl}${path}`);
}
