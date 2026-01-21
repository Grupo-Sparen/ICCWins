import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Get IP from various possible headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    const clientIp = cfConnectingIp || forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    console.log('🌍 Detecting country for IP:', clientIp);

    // Try to detect country using a free IP geolocation service
    let countryCode = 'US'; // Default to US
    let currency = 'USD';
    
    if (clientIp && clientIp !== 'unknown' && !clientIp.includes('127.0.0.1') && !clientIp.includes('localhost')) {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          countryCode = geoData.country_code || 'US';
          console.log('✅ Country detected:', countryCode, 'from IP:', clientIp);
        }
      } catch (error) {
        console.log('⚠️ Geolocation API error, using default US:', error.message);
      }
    }

    // Determine currency based on country
    if (countryCode === 'PE') {
      currency = 'PEN';
    } else {
      currency = 'USD';
    }

    return Response.json({
      country: countryCode,
      currency: currency,
      isPeru: countryCode === 'PE',
      ip: clientIp
    });
  } catch (error) {
    console.error('❌ Error detecting country:', error);
    return Response.json({
      country: 'US',
      currency: 'USD',
      isPeru: false,
      error: error.message
    }, { status: 200 }); // Return 200 with defaults even on error
  }
});