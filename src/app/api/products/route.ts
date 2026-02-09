import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ProductSchema } from '@/lib/validators';
import { z } from 'zod';

export async function GET(request: Request) {
    try {
        const supabase = await createClient(); // Await the promise
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = supabase.from('products').select('*');

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[GET /api/products] Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('[GET /api/products] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient(); // Await the promise

        // 1. Check Auth & Role (Admin only)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        //Ideally check for admin role here (e.g. from profiles/customers table)
        // const { data: customer } = await supabase.from('customers').select('role').eq('id', user.id).single();
        // if (customer?.role !== 'store admin' && customer?.role !== 'owner') {
        //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        // 2. Parse & Validate Body
        const body = await request.json();
        const validatedData = ProductSchema.parse(body);

        // 3. Insert into DB
        const { data, error } = await supabase
            .from('products')
            .insert(validatedData)
            .select()
            .single();

        if (error) {
            console.error('[POST /api/products] DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('[POST /api/products] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
