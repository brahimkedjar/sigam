import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Always server-side in middleware

const protectedRoutes = [
  '/dashboard',
  '/admin_panel',
  '/demande',
  '/DEA',
  '/gestion-permis',
  '/controle-minier',
  '/instruction-cadastrale'
];

const routePermissionMap: Record<string, string> = {
  '/dashboard': 'view_dashboard',
  '/admin_panel': 'Admin-Panel',
  '/DEA': 'Payments',
  '/gestion-permis': 'manage_permits',
  '/controle-minier': 'controle_minier',
  '/instruction-cadastrale': 'view_cadastre',
};

export async function middleware(req: NextRequest) {
const token = req.cookies.get('token')?.value;
  const pathname = req.nextUrl.pathname;

  console.log('🟡 [Middleware] Request Path:', pathname);
  console.log('🟡 [Middleware] API URL:', API_URL);

  if (!token) {
    console.warn('🟠 [Middleware] No token found in cookies.');
    return NextResponse.redirect(new URL('/unauthorized/page?reason=no_token', req.url));
  }

  try {
    console.log('🟡 [Middleware] Sending request to /auth/me with token...');

    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Required in Edge Runtime
      cache: 'no-store',
    });

    console.log('🟡 [Middleware] Response status:', res.status);

    if (!res.ok) {
      const body = await res.text();
      console.error('🔴 [Middleware] Auth API returned error:', body);
      return NextResponse.redirect(new URL(`/unauthorized/page?reason=${res.status}`, req.url));
    }

    const user = await res.json();
    console.log('🟢 [Middleware] Authenticated user:', user);

    // Add user info to request if needed (optional)
    return NextResponse.next();
  } catch (err: any) {
    console.error('❌ [Middleware] Fetch failed:', err.message);
    console.error('❌ [Middleware] Full error:', err);

    return NextResponse.redirect(new URL('/unauthorized/page?reason=fetch_failed', req.url));
  }
}

export const config = {
  matcher: [
   
    '/dashboard/:path*',
    '/admin_panel/:path*',
    '/demande/:path*',
    '/DEA/:path*',
    '/gestion-permis/:path*',
    '/controle-minier/:path*',
    '/instruction-cadastrale/:path*'
  ],
};
