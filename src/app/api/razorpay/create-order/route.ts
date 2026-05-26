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
    const body = await req.json();
    console.log("CREATE ORDER BODY:", body);
    const { amount, planType, actionType } = body;
    console.log("CREATE ORDER TYPE:", { planType, actionType, amount });

    // Validate input
    if (!amount) return NextResponse.json({ error: "Missing amount" }, { status: 400 });

    // Validate plan/action
    const validCreatorPlans: Record<string, number> = { 
      'creator_pro': 99, 
      'creator_premium': 249 
    };
    
    const validClientActions: Record<string, number> = { 
      'unlock_creator_chat': 49, // Base/Average price for generic UI; actual check happens in UnlockModal
      'boost_project_3_days': 49, 
      'boost_project_7_days': 99, 
      'urgent_project_badge': 99, 
      'premium_hiring_support': 199 
    };

    const isCreatorPlan = planType && validCreatorPlans.hasOwnProperty(planType);
    const isClientAction = actionType && validClientActions.hasOwnProperty(actionType);

    if (!isCreatorPlan && !isClientAction) {
      return NextResponse.json({ error: `Invalid plan or action type: ${planType || actionType}` }, { status: 400 });
    }

    // Verify amount
    let expectedAmount = 0;
    if (isCreatorPlan) expectedAmount = validCreatorPlans[planType];
    else if (isClientAction) expectedAmount = validClientActions[actionType];

    // For chat unlocks, we allow a range based on tier (29, 49, 99)
    if (actionType === 'unlock_creator_chat') {
      if (![29, 49, 99].includes(amount)) {
        return NextResponse.json({ error: "Invalid unlock amount" }, { status: 400 });
      }
    } else if (amount !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

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
