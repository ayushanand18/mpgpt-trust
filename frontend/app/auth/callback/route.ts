
import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {session, user} = data
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let response = NextResponse.next()
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        response = NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        response= NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        response = NextResponse.redirect(`${origin}${next}`)
      }
      
      response.cookies.set({
        name: 'token',
        value: session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'strict', 
        maxAge: session.expires_in,
      })
      return response
    }

    console.error('Error exchanging code for session:', error.message)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}