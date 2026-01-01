
import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    if (error) {
        console.error('Error getting user claims during logout:', error.message)
    }

    if (data?.claims) {
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
            console.error('Error during sign out:', signOutError.message)
        }
    }

    const { origin } = new URL(request.url)

    let response = NextResponse.redirect(`${origin}/`)
    response.cookies.delete('token')

    return response
}