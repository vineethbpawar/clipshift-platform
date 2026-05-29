import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.RAZORPAY_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      type, // 'creator_unlock' or 'project_unlock'
      payload // project_id/freelancer_id or client_id/creator_id
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay identifiers' }, { status: 400 });
    }

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("INVALID SIGNATURE:", { expectedSignature, razorpay_signature });
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Record Payment
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        client_id: type === 'creator_unlock' ? payload.client_id : null,
        creator_id: type === 'project_unlock' ? payload.freelancer_id : null,
        amount: payload.amount,
        status: 'completed'
      }, { onConflict: 'order_id' })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment Record Error:', paymentError);
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }

    // 3. Perform Unlock or Upgrade based on type
    if (type === 'creator_unlock') {
      const { error: unlockError } = await supabase
        .from('creator_unlocks')
        .upsert({
          client_id: payload.client_id,
          creator_id: payload.creator_id,
          unlock_fee: payload.amount / 100,
          payment_status: 'paid'
        }, { onConflict: 'client_id,creator_id' });

      if (unlockError) {
        console.error('Creator Unlock Error:', unlockError);
        return NextResponse.json({ error: 'Failed to unlock creator' }, { status: 500 });
      }
    } else if (type === 'project_unlock') {
      const { error: unlockError } = await supabase
        .from('project_unlocks')
        .upsert({
          project_id: payload.project_id,
          freelancer_id: payload.freelancer_id,
          unlock_fee: payload.amount / 100,
          payment_status: 'paid'
        }, { onConflict: 'project_id,freelancer_id' });

      if (unlockError) {
        console.error('Project Unlock Error:', unlockError);
        return NextResponse.json({ error: 'Failed to unlock project' }, { status: 500 });
      }
    } else if (type === 'plan_upgrade') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan_type: payload.planType,
          plan_expires_at: expiresAt.toISOString(),
          featured_creator: payload.planType === 'creator_pro' || payload.planType === 'creator_premium',
          verified_creator: payload.planType === 'creator_premium'
        })
        .eq('id', payload.user_id);

      if (updateError) {
        console.error('Plan Update Error:', updateError);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified and unlock successful' });
  } catch (error: unknown) {
    console.error('Razorpay Verification Error:', error);
    const errorMessage = error instanceof Error ? error.message : "Verification process failed";
    return NextResponse.json(
      { error: 'Verification process failed', details: errorMessage },
      { status: 500 }
    );
  }
}

