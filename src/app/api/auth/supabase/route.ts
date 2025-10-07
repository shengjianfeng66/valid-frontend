import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Auth API called')
    const { provider } = await request.json()
    console.log('Provider:', provider)
    
    if (!provider || !['google', 'github'].includes(provider)) {
      console.error('Invalid provider:', provider)
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    
    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? `Set: ${supabaseUrl}` : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? `Set: ${supabaseAnonKey.substring(0, 20)}...` : 'Missing',
      siteUrl: siteUrl ? `Set: ${siteUrl}` : 'Missing'
    })
    
    console.log('Complete callback URL will be:', `${siteUrl}/api/auth/callback`)

    if (!supabaseUrl || !supabaseAnonKey || !siteUrl) {
      console.error('Missing environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    console.log('Supabase client created')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github',
      options: {
        redirectTo: `${siteUrl}/api/auth/callback`,
      },
    })

    console.log('Supabase OAuth response:', {
      data: JSON.stringify(data, null, 2),
      error: error ? JSON.stringify(error, null, 2) : null,
      hasUrl: data?.url ? true : false,
      urlValue: data?.url || 'undefined'
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || !data.url) {
      console.error('No OAuth URL received from Supabase:', {
        dataExists: !!data,
        dataKeys: data ? Object.keys(data) : [],
        fullData: JSON.stringify(data, null, 2)
      })
      return NextResponse.json(
        { error: 'OAuth URL not generated. Please check Supabase OAuth provider configuration.' },
        { status: 500 }
      )
    }

    console.log('OAuth URL generated successfully:', data.url)
    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}