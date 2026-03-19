import { supabaseAdmin } from '../lib/supabase';
import { syncUserListeningData } from '../services/spotifySync';

async function main() {
  const { data: users, error } = await supabaseAdmin.from('users').select('id');

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  if (!users || users.length === 0) {
    console.log('No users found to sync.');
    return;
  }

  for (const user of users) {
    console.log(`Syncing Spotify data for user ${user.id}`);
    await syncUserListeningData(user.id);
  }

  console.log('Sync complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
