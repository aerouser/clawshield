// ClawShield Cloud - Edge Function: scan-report
// Recebe relatórios de scans do scanner local

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get API key from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Parse request body
    const payload = await req.json();
    
    // Validate required fields
    if (!payload.skill_name || !payload.status || typeof payload.score !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key and get user
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = keyData.user_id;

    // Insert scan record
    const { data: scanData, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        skill_name: payload.skill_name,
        skill_fingerprint: payload.skill_fingerprint,
        status: payload.status,
        score: payload.score,
        files_scanned: payload.files_scanned || 0,
        issues_count: payload.issues_count || 0,
        critical_count: payload.critical_count || 0,
        high_count: payload.high_count || 0,
        medium_count: payload.medium_count || 0,
        findings: payload.findings || []
      })
      .select()
      .single();

    if (scanError) {
      throw scanError;
    }

    // Update skill reputation (upsert)
    const { data: existingRep } = await supabase
      .from('skills_reputation')
      .select('total_scans, blocked_count, reputation_score')
      .eq('skill_fingerprint', payload.skill_fingerprint)
      .single();

    if (existingRep) {
      // Update existing
      const newTotal = existingRep.total_scans + 1;
      const newBlocked = existingRep.blocked_count + (payload.status === 'BLOCKED' ? 1 : 0);
      const newReputation = Math.max(0, Math.min(100, 
        existingRep.reputation_score - (payload.status === 'BLOCKED' ? 20 : payload.status === 'WARNING' ? 10 : 0)
      ));

      await supabase
        .from('skills_reputation')
        .update({
          total_scans: newTotal,
          blocked_count: newBlocked,
          reputation_score: newReputation,
          last_updated: new Date().toISOString()
        })
        .eq('skill_fingerprint', payload.skill_fingerprint);
    } else {
      // Insert new
      await supabase
        .from('skills_reputation')
        .insert({
          skill_fingerprint: payload.skill_fingerprint,
          skill_name: payload.skill_name,
          total_scans: 1,
          blocked_count: payload.status === 'BLOCKED' ? 1 : 0,
          reputation_score: payload.status === 'BLOCKED' ? 20 : payload.status === 'WARNING' ? 50 : 80,
          last_updated: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        scan_id: scanData.id,
        message: 'Scan report saved successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing scan report:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
