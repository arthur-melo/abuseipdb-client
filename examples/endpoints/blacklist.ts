import { AbuseIPDBClient } from 'abuseipdb-client';

import type { BlacklistOptions } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

// AbuseIPDB Docs: https://docs.abuseipdb.com/#blacklist-endpoint

async function blacklistEndpointAsJSON() {
  // Options can be omitted, as the API has default values for every field.
  // `exceptCountries` and `onlyCountries` are mutually exclusive, only one can be defined at a time.
  const options: BlacklistOptions = {
    // confidenceMinimum: 90,
    // limit: 100,
    // exceptCountries: [],
    onlyCountries: ['US', 'BR'], // ISO 3166-1 alpha-2 array.
    plaintext: false,
  };

  const { headers, error, result } = await client.blacklist(options);

  console.log(headers);

  if (error) {
    console.log(error);
  }

  if (result) {
    console.log(result.meta);
    console.log(result.data);
  }
}

// Blacklist can also output a plaintext response: https://docs.abuseipdb.com/#plaintext-blacklist
async function blacklistEndpointAsText() {
  // Options can be omitted, as the API has default values for every field.
  // `exceptCountries` and `onlyCountries` are mutually exclusive, only one can be defined at a time.
  const options: BlacklistOptions = {
    // confidenceMinimum: 90,
    // limit: 100,
    // exceptCountries: [],
    onlyCountries: ['US', 'BR'], // ISO 3166-1 alpha-2 array.
    plaintext: true,
  };

  const { headers, error, result } = await client.blacklist(options);

  console.log(headers);

  if (error) {
    console.log(error);
  }

  // When using the `plaintext` parameter, the `data` attribute of the result returns a concatenated string of addresses, instead of an object.
  if (result) {
    console.log(result.meta);

    // Returns string of IP addresses:
    // Example: '10.0.0.1\n10.0.0.2\n10.0.0.3'
    console.log(result.data);
  }
}

try {
  await blacklistEndpointAsJSON();
  await blacklistEndpointAsText();
} catch (err) {
  console.log(err);
}
