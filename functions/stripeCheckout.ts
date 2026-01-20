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

    const body = await req.json();
    const { type, priceId, planId, tournamentId, registrationData } = body;

    console.log(`📝 Creating checkout for ${type}:`, { priceId, planId, tournamentId });

    if (type === 'subscription') {
      if (!priceId || !planId) {
        console.error('❌ Missing required parameters for subscription:', { priceId, planId });
        return Response.json({ error: 'Missing priceId or planId' }, { status: 400 });
      }

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
      if (!tournamentId || !registrationData) {
        console.error('❌ Missing required parameters for tournament:', { tournamentId, registrationData });
        return Response.json({ error: 'Missing tournamentId or registrationData' }, { status: 400 });
      }
      
      const tournament = await base44.entities.Tournament.filter({ id: tournamentId }).then(t => t[0]);

      if (!tournament) {
        return Response.json({ error: 'Tournament not found' }, { status: 404 });
      }

      // Create TournamentParticipant BEFORE Stripe checkout with pending status
      console.log('📝 Creating tournament participant with pending payment...');
      const participant = await base44.entities.TournamentParticipant.create({
        tournament_id: tournamentId,
        tournament_name: tournament.name,
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        player_username: registrationData.player_username,
        country: registrationData.country,
        age: parseInt(registrationData.age),
        phone: registrationData.phone,
        payment_status: 'pending',
        amount_paid: tournament.entry_fee,
      });
      console.log('✅ Participant created:', participant.id);

      // Update tournament participant count
      await base44.entities.Tournament.update(tournamentId, {
        current_participants: tournament.current_participants + 1
      });

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