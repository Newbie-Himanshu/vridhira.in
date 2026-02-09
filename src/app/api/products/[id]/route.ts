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

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Fetch single product by ID (public)
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[GET /api/products/[id]] Supabase error:', error);
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('[GET /api/products/[id]] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update product by ID (admin/owner only)
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check Auth & Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Parse & Validate Body
        const body = await request.json();

        // Use partial schema for updates (all fields optional except what's provided)
        const UpdateProductSchema = ProductSchema.partial();
        const validatedData = UpdateProductSchema.parse(body);

        // 3. Update in DB
        const { data, error } = await supabase
            .from('products')
            .update(validatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[PUT /api/products/[id]] DB Error:', error);
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('[PUT /api/products/[id]] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove product by ID (admin/owner only)
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check Auth & Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Check if product exists first
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 3. Delete from DB
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DELETE /api/products/[id]] DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('[DELETE /api/products/[id]] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
