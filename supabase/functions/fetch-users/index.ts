import { createClient, SupabaseClient } from '@supabase/supabase-js';
import express, { Request, Response, NextFunction } from 'express';

const app = express();
const port = process.env.PORT || 3000;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

app.use((req: Request, res: Response, next: NextFunction) => {
  res.set(corsHeaders);
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }
  next();
});

app.get('/fetch-users', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin: SupabaseClient = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Failed to fetch user count: ${countError.message}`);
    }

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('full_name');

    if (usersError) {
      throw new Error(`Failed to fetch user names: ${usersError.message}`);
    }

    res.status(200).json({
      success: true,
      totalUsers: count,
      userNames: users.map((user: { full_name: string }) => user.full_name),
    });
  } catch (error) {
    console.error('Error in fetch-users function:', error);

    res.status(400).json({
      success: false,
      error: (error instanceof Error) ? error.message : 'An unexpected error occurred',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});