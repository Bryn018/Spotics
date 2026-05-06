
    const { Client } = require('pg');
    (async () => {
      const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await client.connect();
      const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND column_name='id'");
      console.log(JSON.stringify(res.rows));
      await client.end();
    })().catch(e => console.error(e.message));
    