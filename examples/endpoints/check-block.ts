import { AbuseIPDBClient } from 'abuseipdb-client';

import type { CheckBlockOptions } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#check-block-endpoint

try {
  // Options can be omitted, as the API has default values for every field.
  const options: CheckBlockOptions = {
    maxAgeInDays: 1,
  };

  // Must be an IPv4/IPv6 CIDR.
  const network = '192.168.0.0/24';

  const { headers, error, result } = await client.checkBlock(network, options);

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
