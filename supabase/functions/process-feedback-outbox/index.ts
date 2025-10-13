import { createClient } from 'npm:@supabase/supabase-js@2';

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
    console.log('Starting feedback outbox processing...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookUrl = Deno.env.get('WEBHOOK_URL');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!webhookUrl) {
      console.error('Missing WEBHOOK_URL environment variable');
      return new Response(
        JSON.stringify({ error: 'Missing webhook URL configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Environment variables loaded successfully');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending feedback submissions
    console.log('Fetching pending feedback submissions...');
    const { data: pendingFeedback, error: fetchError } = await supabase
      .from('feedback_outbox')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching pending feedback:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending feedback' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${pendingFeedback?.length || 0} pending feedback submissions`);

    if (!pendingFeedback || pendingFeedback.length === 0) {
      console.log('No pending feedback to process');
      return new Response(
        JSON.stringify({
          ok: true,
          result: {
            processed: 0,
            message: 'No pending feedback to process'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let processedCount = 0;
    let failedCount = 0;

    // Process each pending feedback submission
    for (const feedback of pendingFeedback) {
      console.log(`Processing feedback ID: ${feedback.id}`);

      try {
        // Update status to 'processing'
        await supabase
          .from('feedback_outbox')
          .update({ 
            status: 'processing',
            attempts: (feedback.attempts || 0) + 1
          })
          .eq('id', feedback.id);

        // Call the send-feedback-email function
        console.log(`Calling send-feedback-email function for feedback ID: ${feedback.id}`);
        
        const emailResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            record: feedback.payload
          }),
        });

        let responseText = '';
        try {
          responseText = await emailResponse.text();
        } catch (textError) {
          console.error(`Failed to read response text for feedback ID: ${feedback.id}:`, textError);
          responseText = 'Failed to read response';
        }
        
        console.log(`Email response for feedback ID: ${feedback.id} - Status: ${emailResponse.status}, Body: ${responseText}`);
        
        // Consider both 200 and 201 as success, and also check for success indicators in response
        const isSuccess = emailResponse.ok || emailResponse.status === 200 || emailResponse.status === 201;
        
        if (isSuccess) {
          console.log(`Email sent successfully for feedback ID: ${feedback.id}`);
          
          // Update status to 'processed'
          const { error: updateError } = await supabase
            .from('feedback_outbox')
            .update({ 
              status: 'processed',
              processed_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', feedback.id);

          if (updateError) {
            console.error(`Failed to update status to processed for feedback ID: ${feedback.id}`, updateError);
            // Even if DB update fails, don't retry the email
            failedCount++;
          } else {
            console.log(`Successfully updated status to processed for feedback ID: ${feedback.id}`);
            processedCount++;
          }
        } else {
          console.error(`Failed to send email for feedback ID: ${feedback.id}. Status: ${emailResponse.status}, Error: ${responseText}`);
          
          // Only mark as failed if it's not a temporary error and we've tried multiple times
          const maxAttempts = 3;
          const currentAttempts = feedback.attempts || 0;
          
          if (currentAttempts >= maxAttempts) {
            console.log(`Max attempts reached for feedback ID: ${feedback.id}, marking as failed`);
            
            // Update status to 'failed'
            const { error: updateError } = await supabase
              .from('feedback_outbox')
              .update({ 
                status: 'failed',
                error_message: `HTTP ${emailResponse.status}: ${responseText} (after ${currentAttempts} attempts)`
              })
              .eq('id', feedback.id);

            if (updateError) {
              console.error(`Failed to update status to failed for feedback ID: ${feedback.id}`, updateError);
            }
            
            failedCount++;
          } else {
            console.log(`Temporary failure for feedback ID: ${feedback.id}, will retry later (attempt ${currentAttempts}/${maxAttempts})`);
            
            // Reset status to 'pending' for retry, but don't increment attempts here (already done above)
            const { error: updateError } = await supabase
              .from('feedback_outbox')
              .update({ 
                status: 'pending',
                error_message: `Temporary failure: HTTP ${emailResponse.status}: ${responseText}`
              })
              .eq('id', feedback.id);

            if (updateError) {
              console.error(`Failed to reset status to pending for feedback ID: ${feedback.id}`, updateError);
            }
          }
        }

        // Add delay to respect Resend rate limits (2 requests per second)
        // Wait 600ms between requests to stay well under the limit
        if (processedCount + failedCount < pendingFeedback.length) {
          console.log('Waiting 600ms before processing next feedback...');
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } catch (error) {
        console.error(`Error processing feedback ID: ${feedback.id}`, error);
        
        // Update status to 'failed'
        await supabase
          .from('feedback_outbox')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', feedback.id);

        failedCount++;
      }
    }

    console.log(`Processing complete. Processed: ${processedCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        ok: true,
        result: {
          processed: processedCount,
          failed: failedCount,
          total: pendingFeedback.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in process-feedback-outbox:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});