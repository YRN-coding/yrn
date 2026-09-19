import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your local environment.');
}

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
