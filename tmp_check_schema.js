
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND column_name='id'");
  console.log('Column info:', JSON.stringify(res.rows));
  const sample = await client.query("SELECT id FROM users LIMIT 1");
  console.log('Sample id:', sample.rows[0]?.id);
  client.end();
}).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
