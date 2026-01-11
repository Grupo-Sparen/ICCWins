import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, priceId, planId, tournamentId } = await req.json();

    console.log(`📝 Creating checkout for ${type}:`, { priceId, planId, tournamentId });

    if (type === 'subscription') {
      // Subscription checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.headers.get('origin')}/Suscripcion?success=true&planId=${planId}`,
        cancel_url: `${req.headers.get('origin')}/Suscripcion?canceled=true`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          type: 'subscription',
          planId: planId,
          userEmail: user.email,
        },
      });

      console.log('✅ Subscription checkout session created:', session.id);
      return Response.json({ sessionUrl: session.url });
    } else if (type === 'tournament') {
      // Tournament entry fee checkout
      const tournament = await base44.entities.Tournament.filter({ id: tournamentId }).then(t => t[0]);

      if (!tournament) {
        return Response.json({ error: 'Tournament not found' }, { status: 404 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Entrada - ${tournament.name}`,
                description: `Entrada para el torneo ${tournament.name}`,
              },
              unit_amount: Math.round(tournament.entry_fee * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.get('origin')}/Torneos?success=true&tournamentId=${tournamentId}`,
        cancel_url: `${req.headers.get('origin')}/Torneos?canceled=true`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          type: 'tournament',
          tournamentId: tournamentId,
          userEmail: user.email,
        },
      });

      console.log('✅ Tournament checkout session created:', session.id);
      return Response.json({ sessionUrl: session.url });
    }

    return Response.json({ error: 'Invalid checkout type' }, { status: 400 });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});