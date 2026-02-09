import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ProductSchema } from '@/lib/validators';
import { z } from 'zod';

// Helper: Check if user is admin or owner
async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { authorized: false, status: 401, error: 'Unauthorized' };
    }

    const { data: customer } = await supabase
        .from('customers')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!customer || !['store admin', 'owner'].includes(customer.role)) {
        return { authorized: false, status: 403, error: 'Forbidden - Admin access required' };
    }

    return { authorized: true, user, customer };
}

// GET: Fetch all products (public)
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
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

// POST: Create new product (admin/owner only)
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check Auth & Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

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

// PUT: Update existing product (admin/owner only)
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check Auth & Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Parse & Validate Body
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Validate with ProductSchema (id is optional in schema, so this works)
        const validatedData = ProductSchema.parse(body);

        // 3. Update in DB
        const { data, error } = await supabase
            .from('products')
            .update(validatedData)
            .eq('id', body.id)
            .select()
            .single();

        if (error) {
            console.error('[PUT /api/products] DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ data });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('[PUT /api/products] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove product (admin/owner only)
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check Auth & Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Get product ID from body
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // 3. Delete from DB
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', body.id);

        if (error) {
            console.error('[DELETE /api/products] DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('[DELETE /api/products] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
