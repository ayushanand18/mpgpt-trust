import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith("/admin")
  const isUserRoute = pathname.startsWith("/user")
  const isAuthRoute = pathname.startsWith("/auth") && !pathname.startsWith("/auth/")

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  if (!user && (isAdminRoute || isUserRoute)) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  if (user && (isAdminRoute || isUserRoute || isAuthRoute)) {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${user.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        return NextResponse.redirect(new URL("/auth", request.url))
      }

      const userData = (await res.json()) ?? {}
      const role = userData.Data?.User?.Role

      if (role === "admin" && isUserRoute) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        return NextResponse.redirect(url)
      }

      if (role !== "admin" && isAdminRoute) {
        const url = request.nextUrl.clone()
        url.pathname = "/user"
        return NextResponse.redirect(url)
      }

      if (isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = role === "admin" || role === "superuser" ? "/admin" : "/user"
        return NextResponse.redirect(url)
      }

      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
  }


  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}