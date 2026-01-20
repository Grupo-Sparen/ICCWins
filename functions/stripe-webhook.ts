import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('🔔 Webhook signature:', signature ? '✓' : '✗');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`📨 Webhook event: ${event.type}`);

    const base44 = createClientFromRequest(req);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Checkout completed:', session.id);

      const metadata = session.metadata;
      if (metadata.type === 'subscription') {
        const user = await base44.asServiceRole.entities.User.filter({ email: metadata.userEmail }).then(u => u[0]);

        if (user) {
          // Obtener el plan para obtener el nombre y duración
          const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({ id: metadata.planId }).then(p => p[0]);
          
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + (plan?.duration_months || 1));
          
          const nextBillingDate = new Date(endDate);
          
          // Create subscription record in database
          await base44.asServiceRole.entities.Subscription.create({
            user_email: metadata.userEmail,
            user_name: user.full_name,
            plan_id: metadata.planId,
            plan_name: plan?.name_es || 'Plan Premium',
            status: 'active',
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            next_billing_date: nextBillingDate.toISOString().split('T')[0],
            amount_paid: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            payment_method: 'stripe',
            auto_renew: true,
          });

          console.log('✅ Subscription created for:', metadata.userEmail, 'Plan:', plan?.name_es);
        }
      } else if (metadata.type === 'tournament') {
        const user = await base44.asServiceRole.entities.User.filter({ email: metadata.userEmail }).then(u => u[0]);

        if (user) {
          console.log('👤 Found user:', user.id, user.email);
          
          // Update tournament participant payment status
          const participants = await base44.asServiceRole.entities.TournamentParticipant.filter({
            tournament_id: metadata.tournamentId,
            user_id: user.id,
          });

          console.log('🔍 Found participants:', participants.length);

          if (participants.length > 0) {
            console.log('💳 Updating participant:', participants[0].id);
            await base44.asServiceRole.entities.TournamentParticipant.update(participants[0].id, {
              payment_status: 'paid',
              amount_paid: session.amount_total / 100,
              payment_method: 'stripe',
              payment_date: new Date().toISOString(),
              stripe_session_id: session.id,
            });

            console.log('✅ Tournament payment confirmed for:', metadata.userEmail);
          } else {
            console.warn('⚠️ No TournamentParticipant found for user:', user.id, 'tournament:', metadata.tournamentId);
          }
        } else {
          console.warn('⚠️ User not found for email:', metadata.userEmail);
        }
      }
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      console.log('💰 Invoice paid:', invoice.id);

      // Update subscription status if it's a subscription renewal
      if (invoice.subscription) {
        const email = invoice.customer_email;
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          user_email: email,
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: 'active',
          });

          console.log('✅ Subscription renewed for:', email);
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log('❌ Subscription canceled:', subscription.id);

      // Update subscription status
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        user_email: subscription.customer_email || subscription.metadata?.userEmail,
      });

      if (subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'cancelled',
        });

        console.log('✅ Subscription marked as cancelled');
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});