import {NextRequest, NextResponse} from 'next/server'
import {Auth} from "./data/auth";

export default async function middleware(req: NextRequest) {

    console.log('middleware()')

    const path = req.nextUrl.pathname
    const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/welcome')
    const isPublicRoute = !isProtectedRoute

    if (isPublicRoute) {
        console.log('middleware() isPublicRoute')
        return NextResponse.next()
    }

    const isAuthed = await Auth.checkIsAuthed()
    console.log('isAuthed', isAuthed)

    if (!isAuthed) {
        console.log('middleware() isProtectedRoute && !isAuthed')
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    console.log('middleware() isProtectedRoute && isAuthed')
    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}