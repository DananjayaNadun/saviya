import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // PayHere sends data as application/x-www-form-urlencoded
    const formData = await request.formData();

    const merchant_id = formData.get('merchant_id') as string;
    const order_id = formData.get('order_id') as string;
    const payment_id = formData.get('payment_id') as string;
    const payhere_amount = formData.get('payhere_amount') as string;
    const payhere_currency = formData.get('payhere_currency') as string;
    const status_code = formData.get('status_code') as string;
    const md5sig = formData.get('md5sig') as string;

    // The order_id from PayHere represents our milestone_id in this context
    const milestone_id = order_id;

    // 1. Verify PayHere MD5 Signature
    // Signature Formula: md5sig = MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    
    const localSig = crypto
      .createHash('md5')
      .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`)
      .digest('hex')
      .toUpperCase();

    if (localSig !== md5sig) {
      console.error('Invalid PayHere signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Validate currency and status
    if (payhere_currency !== 'LKR') {
      return NextResponse.json({ error: 'Only LKR is supported' }, { status: 400 });
    }

    // Status code 2 represents a success in PayHere
    if (status_code !== '2') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // 3. Update the milestone in Supabase to Funded_in_Escrow
    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select('id, status, amount')
      .eq('id', milestone_id)
      .single();

    if (fetchError || !milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestone.status !== 'Unfunded') {
      return NextResponse.json({ error: 'Milestone is already funded or in an invalid state' }, { status: 400 });
    }

    // Ensure the paid amount matches or exceeds the expected milestone amount
    if (parseFloat(payhere_amount) < milestone.amount) {
      return NextResponse.json({ error: 'Insufficient funds for this milestone' }, { status: 400 });
    }

    // Proceed to update milestone status
    const { error: updateError } = await supabase
      .from('milestones')
      .update({ status: 'Funded_in_Escrow', updated_at: new Date().toISOString() })
      .eq('id', milestone_id);

    if (updateError) {
      console.error('Failed to update milestone status:', updateError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Return 200 OK to PayHere to acknowledge receipt
    return NextResponse.json({ success: true, message: 'Milestone successfully funded into Escrow via PayHere' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
