import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? 'https://qbbwmgpzfmeuvvoprkuu.supabase.co';
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiYndtZ3B6Zm1ldXZ2b3Bya3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NTk5NjYsImV4cCI6MjA4OTAzNTk2Nn0.wdAG1x8JxlWaiiXiBjJubSTslX0L-FXnA0Jug9glS1k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadDepositProof(userId: string, file: File): Promise<{ url: string; fileName: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('deposit-proofs')
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from('deposit-proofs')
    .getPublicUrl(fileName);

  return { url: data.publicUrl, fileName: file.name };
}
