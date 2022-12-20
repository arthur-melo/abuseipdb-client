import { AbuseIPDBClient } from 'abuseipdb-client';

import type { CheckOptions } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#check-endpoint

try {
  // Options can be omitted, as the API has default values for every field.
  const options: CheckOptions = {
    maxAgeInDays: 1,
    verbose: true,
  };

  const { headers, error, result } = await client.check('127.0.0.1', options);

  console.log(headers);

  if (error) {
    console.log(error);
  }

  if (result) {
    console.log(result);
  }
} catch (err) {
  console.log(err);
}
