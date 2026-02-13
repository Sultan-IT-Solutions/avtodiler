const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:4000';

async function run() {
  const res = await fetch(`${baseUrl}/_health`);
  const json = await res.json();
  if (!res.ok || !json.ok) {
    console.error('Smoke test failed', res.status, json);
    process.exit(1);
  }
  console.log('Smoke test OK');
}

run().catch(err => {
  console.error('Smoke test error', err);
  process.exit(1);
});
