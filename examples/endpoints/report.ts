import { AbuseIPDBClient, ReportCategory } from 'abuseipdb-client';

import type { ReportOptions } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#report-endpoint

try {
  // Creates an array of report categories (https://www.abuseipdb.com/categories) using the Enum helper.
  const categories = [
    ReportCategory.BadWebBot,
    ReportCategory.BlogSpam,
    ReportCategory.DDOSAttack,
  ];

  // Options can be omitted, comment will be left empty if not defined.
  const options: ReportOptions = {
    comment: 'Comment to be added to the report.',
  };

  const { headers, error, result } = await client.report(
    '127.0.0.1',
    categories,
    options,
  );

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
