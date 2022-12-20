import { AbuseIPDBClient } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#clear-address-endpoint

try {
  const response = await client.clearAddress('127.0.0.1');

  const { headers, error, result } = response;

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
