import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'admin'
    const isCliente = token?.role === 'cliente'
    const pathname = req.nextUrl.pathname

    // Proteger rotas admin
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Proteger rotas cliente
    if (pathname.startsWith('/cliente') && !isCliente && !isAdmin) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*']
}
