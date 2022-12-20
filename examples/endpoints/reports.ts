import { AbuseIPDBClient } from 'abuseipdb-client';

import type { ReportsOptions } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#reports-endpoint

try {
  // Options can be omitted, as the API has default values for every field.
  const options: ReportsOptions = {
    maxAgeInDays: 1,
    page: 1,
    perPage: 1,
  };

  const { headers, error, result } = await client.reports('127.0.0.1', options);

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
