import { resolve } from 'node:path';
import { AbuseIPDBClient } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#bulk-report-endpoint

try {
  // Report file structure: https://www.abuseipdb.com/bulk-report
  // Should contain the filepath to a report to be sent.
  const file = resolve('examples', 'data', 'report.csv');

  const { headers, error, result } = await client.bulkReport(file);

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
