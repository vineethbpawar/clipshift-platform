import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Ideally use service role key if available
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      client_id,
      creator_id,
      amount
    } = await req.json();

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Update Payments Table
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .upsert({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        client_id,
        creator_id,
        amount,
        status: 'completed'
      }, { onConflict: 'order_id' })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment Record Error:', paymentError);
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }

    // 3. Unlock Chat
    const { error: unlockError } = await supabase
      .from('unlocked_chats')
      .upsert({
        client_id,
        creator_id,
        payment_id: payment.id
      }, { onConflict: 'client_id,creator_id' });

    if (unlockError) {
      console.error('Unlock Chat Error:', unlockError);
      return NextResponse.json({ error: 'Failed to unlock chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Payment verified and chat unlocked' });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { error: 'Verification process failed', details: error.message },
      { status: 500 }
    );
  }
}
