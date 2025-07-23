import { NextRequest, NextResponse } from 'next/server';

const apiURL = process.env.NEXT_PUBLIC_API_URL; // Always server-side in middleware

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
const token = req.cookies.get('token')?.value;

  // Redirect authenticated users away from login page
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/permis_dashboard/PermisDashboard', req.url));
  }

  // Check for protected route
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/unauthorized/page?reason=not_authenticated', req.url));
    }

    try {
      const res = await fetch(`${apiURL}/auth/me`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  cache: 'no-store',
});



      if (!res.ok) throw new Error('Unauthorized');

      const { user } = await res.json();

      // Admin panel access check
      if (pathname.startsWith('/admin_panel') && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized/page?reason=insufficient_role', req.url));
      }

      // Permission check
      for (const [route, requiredPermission] of Object.entries(routePermissionMap)) {
        if (pathname.startsWith(route) && !user.permissions.includes(requiredPermission)) {
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
