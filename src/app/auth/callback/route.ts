import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && user) {
            // Check if customer profile exists
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('id', user.id)
                .single();

            // If no customer profile, create one
            if (!existingCustomer) {
                const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                const nameParts = fullName.split(' ');

                await supabase.from('customers').insert({
                    id: user.id,
                    email: user.email,
                    first_name: nameParts[0] || 'Artisan',
                    last_name: nameParts.slice(1).join(' ') || 'Enthusiast',
                    role: 'user',
                    is_verified: true // Google users are auto-verified
                });
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // If there's an error, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
