const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing feedback email request...');
    
    const resend = new (await import('npm:resend')).Resend(Deno.env.get('RESEND_API_KEY'));
    const recipientEmail = Deno.env.get('FEEDBACK_RECIPIENT_EMAIL');

    if (!recipientEmail) {
      console.error('FEEDBACK_RECIPIENT_EMAIL environment variable is not set');
      throw new Error('FEEDBACK_RECIPIENT_EMAIL environment variable is not set.');
    }

    if (!Deno.env.get('RESEND_API_KEY')) {
      console.error('RESEND_API_KEY environment variable is not set');
      throw new Error('RESEND_API_KEY environment variable is not set.');
    }

    // Expect a POST request from the process-feedback-outbox function
    const { record } = await req.json();

    if (!record) {
      console.error('No record found in request body');
      return new Response(JSON.stringify({ error: 'No record found in request body.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { name, email, category, message, contact_phone } = record;
    console.log(`Processing feedback from: ${name} (${email}) - Category: ${category}`);

    const emailBody = `
      New Feedback Submission:

      Name: ${name}
      Email: ${email}
      Category: ${category}
      Message:
      ${message}
      ${contact_phone ? `\nContact Phone: ${contact_phone}` : ''}
    `;

    console.log('Sending email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Feedback Form <onboarding@resend.dev>', // IMPORTANT: Replace with your verified Resend domain
      to: [recipientEmail],
      subject: `New Feedback: ${category} from ${name}`,
      text: emailBody,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Email sent successfully:', data);
    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});