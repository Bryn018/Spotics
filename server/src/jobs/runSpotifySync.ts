import { pool } from '../lib/db';
import { syncUserListeningData } from '../services/spotifySync';

async function main() {
  const result = await pool.query('SELECT id FROM users');
  const users = result.rows;

  if (!users.length) {
    console.log('No users found to sync.');
    await pool.end();
    return;
  }

  for (const user of users) {
    console.log(`Syncing Spotify data for user ${user.id}`);
    await syncUserListeningData(user.id);
  }

  console.log('Sync complete.');
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
