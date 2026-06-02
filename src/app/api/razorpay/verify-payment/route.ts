import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature
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

    if (expectedSignature !== razorpay_signature) {
      console.error("INVALID SIGNATURE");
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Fetch Order from Razorpay to get secure notes
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { userId, planType, actionType, payload: payloadStr } = order.notes as any;
    const payload = JSON.parse(payloadStr || '{}');
    const amount = order.amount as number; // In paise

    // 3. Record Payment
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        client_id: actionType ? userId : null,
        creator_id: planType ? userId : null,
        amount: amount,
        status: 'completed'
      }, { onConflict: 'order_id' });

    if (paymentError) {
      console.error('Payment Record Error:', paymentError);
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }

    // 4. Perform Unlock or Upgrade
    if (actionType === 'unlock_creator_chat') {
      const { error: unlockError } = await supabase
        .from('creator_unlocks')
        .upsert({
          client_id: userId,
          creator_id: payload.creator_id,
          unlock_fee: amount / 100,
          payment_status: 'paid'
        }, { onConflict: 'client_id,creator_id' });

      if (unlockError) throw unlockError;
    } else if (actionType === 'boost_project_3_days' || actionType === 'boost_project_7_days' || actionType === 'urgent_project_badge') {
       // Handle project boosts
       const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          featured: true, 
          urgent: actionType === 'urgent_project_badge' 
        })
        .eq('id', payload.project_id);
       if (updateError) throw updateError;
    } else if (planType) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan_type: planType,
          plan_expires_at: expiresAt.toISOString(),
          featured_creator: planType === 'creator_pro' || planType === 'creator_premium',
          verified_creator: planType === 'creator_premium'
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (error: unknown) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

