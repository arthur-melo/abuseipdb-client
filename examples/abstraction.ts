import { AbuseIPDBClient } from 'abuseipdb-client';
import { ZodError } from 'zod';

import type { CheckOptions } from 'abuseipdb-client';

// This demonstrates how the library defines its responses from the API.
// The `check` API Endpoint (https://docs.abuseipdb.com/#check-endpoint) will be used as an example.

const client = new AbuseIPDBClient('API_KEY');

try {
  // Optional parameters for the `check` API endpoint, can be omitted as there are default values for all fields on the API.
  const options: CheckOptions = {
    verbose: true,
  };

  const response = await client.check('127.0.0.1', options);

  // This library wraps every response in an object containing 3 fields.
  // `error` and `result` are exclusive, either one of them is defined for a given response.
  const { error, result, headers } = response;

  // Could be rate-limit/subscription tier/invalid parameters/5xx errors from the API.
  if (error) {
    console.log(
      'Error received from the server: ',
      // Error wraps a JSON-API compliant object.
      error.errors.map(err => console.log(err.detail)),
    );
  }

  // Query was sucessfull by the API and library.
  if (result) {
    // The `data.abuseConfidenceScore` structure comes from the `check` API endpoint.
    console.log(
      `Confidence score for 127.0.0.1: ${result.data.abuseConfidenceScore}`,
    );
  }

  // Headers are always defined, no matter if the API response returned an `error` or `result`.
  console.log(`Endpoint used: ${headers.url}`);
} catch (err) {
  // Could be schema validation errors (ZodError) https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md.
  if (err instanceof ZodError) {
    console.log(err.issues);
  } else {
    // Or general Network/System errors
    console.log(err);
  }
}
