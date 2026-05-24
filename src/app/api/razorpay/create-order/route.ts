import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  // Validate env
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("RAZORPAY CREATE ORDER ERROR: Environment variables are missing.");
    return NextResponse.json(
      { error: "Payment is not configured yet. Please contact support." },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const { amount, planType } = await req.json();
    console.log("PURCHASE START: Creating order for", planType, "amount:", amount);

    // amount is in rupees from frontend, convert to paise
    const amountInPaise = amount * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${planType}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("CREATE ORDER RESPONSE:", order);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("CREATE ORDER FAILED:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
