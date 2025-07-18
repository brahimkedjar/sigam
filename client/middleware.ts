import { NextRequest, NextResponse } from 'next/server';

const apiURL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL // middleware, server
    : process.env.INTERNAL_API_URL; // browser

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
  const { pathname } = req.nextUrl;

  // Redirect authenticated users away from login
  if (pathname === '/') {
    const token = req.cookies.get('token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/permis_dashboard/PermisDashboard', req.url));
    }
  }

  // Only protect relevant routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/unauthorized/page?reason=not_authenticated', req.url));
    }

    try {
      const res = await fetch(`${apiURL}/auth/me`, {
        method: 'GET',
        headers: { cookie: `token=${token}` },
      });

      if (!res.ok) throw new Error('Unauthorized');

      const data = await res.json();
      const user = data.user;

      // Block admin panel if not admin
      if (pathname.startsWith('/admin_panel') && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized/page?reason=insufficient_role', req.url));
      }

      // Check permission for route
      for (const [route, permission] of Object.entries(routePermissionMap)) {
        if (pathname.startsWith(route) && !user.permissions.includes(permission)) {
          return NextResponse.redirect(new URL('/unauthorized/page?reason=missing_permissions', req.url));
        }
      }

    } catch (err) {
      console.error('❌ Middleware auth error:', err);
      return NextResponse.redirect(new URL('/unauthorized/page?reason=auth_error', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin_panel/:path*',
    '/demande/:path*',
    '/DEA/:path*',
    '/gestion-permis/:path*',
    '/controle-minier/:path*',
    '/instruction-cadastrale/:path*'
  ],
};
