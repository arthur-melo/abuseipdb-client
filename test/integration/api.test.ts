import 'jest-extended';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { jest } from '@jest/globals';

import {
  blacklistJSONResponse,
  blacklistTextResponse,
  bulkReportValidResponse,
  bulkReportInvalidResponse,
  checkBlockResponse,
  checkResponse,
  clearAddressResponse,
  reportResponse,
  reportsResponse,
} from '../data/api.stub.js';
import { AbuseIPDBClient } from '../../lib/index.js';
import { APIResponse, ClientResponse } from '../../lib/types.js';
import {
  BlacklistOptions,
  CheckBlockOptions,
  CheckOptions,
  ReportOptions,
  ReportsOptions,
} from '../../lib/schema.js';

config();

// Increases the test timeout globally, as the API could be slow.
jest.setTimeout(20 * 1000); // 20 seconds.

// Should check for API responses up to 3 times.
const RETRY_TIMES = 3;

describe('AbuseIPDBClient API Tests', () => {
  let client: AbuseIPDBClient;

  const addresses: Array<string> = [
    '127.0.0.1',
    // '::1',
    // '8.8.8.8',
    // '2001:4860:4860::8888',
  ];

  // Retries calling the API `RETRY_TIMES` times before throwing.
  const retry = async <T extends APIResponse>(
    cb: () => Promise<ClientResponse<T>>,
  ) => {
    let response: ClientResponse<T> | null = null;

    for (let i = 0; i < RETRY_TIMES; i++) {
      response = await cb();

      if (response.headers.status !== 500) {
        break;
      }
    }

    // If the server responded with error.
    if (response?.headers.status === 500) {
      throw new Error(`Server error, retried connection ${RETRY_TIMES} times.`);
    }

    return response;
  };

  // Wraps async call to capture API/Server errors.
  const fetchWrapper = async <T extends APIResponse>(
    cb: () => Promise<ClientResponse<T>>,
  ) => {
    const response = await retry(cb);

    // Rate-limit errors.
    // errors[index].status should return a string from the spec, but it is returning a number.
    // I'm typecasting it to keep consistency.
    const status = response?.error?.errors[0].status ?? 0;
    if (+status === 429) {
      throw new Error(response?.error?.errors[0].detail);
    }

    return response;
  };

  beforeAll(() => {
    if (!process.env.TEST_API_KEY) {
      throw new Error('Please specify an API key on the `.env` file.');
    }

    client = new AbuseIPDBClient(process.env.TEST_API_KEY);
  });

  describe('AbuseIPDBClient class', () => {
    it('should return an error on invalid API KEY', async () => {
      const testClient = new AbuseIPDBClient('FAKE_API_KEY');
      const errorResponse = await fetchWrapper(() =>
        testClient.check('127.0.0.1'),
      );

      expect(errorResponse).toMatchObject({
        error: {
          errors: [
            {
              detail:
                'Authentication failed. Your API key is either missing, incorrect, or revoked. Note: The APIv2 key differs from the APIv1 key.',
              status: 401,
            },
          ],
        },
      });
    });
  });

  describe('`check` endpoint', () => {
    it('should verify non verbose response', async () => {
      const checkOptions: CheckOptions = {
        //maxAgeInDays: 30,
        verbose: false,
      };

      const responses = await Promise.all(
        addresses.map(ip => fetchWrapper(() => client.check(ip, checkOptions))),
      );

      responses.forEach(response => expect(response).toEqual(checkResponse));
    });

    it('should verify verbose response', async () => {
      const checkOptions: CheckOptions = {
        //maxAgeInDays: 30,
        verbose: true,
      };

      const responses = await Promise.all(
        addresses.map(ip => fetchWrapper(() => client.check(ip, checkOptions))),
      );

      responses.forEach(response => expect(response).toEqual(checkResponse));
    });
  });

  describe('`reports` endpoint', () => {
    it('should verify the default response', async () => {
      const reportsOptions: ReportsOptions = {
        //maxAgeInDays: 30,
        //page: 1,
        //perPage: 25,
      };

      const responses = await Promise.all(
        addresses.map(ip =>
          fetchWrapper(() => client.reports(ip, reportsOptions)),
        ),
      );

      responses.forEach(response => expect(response).toEqual(reportsResponse));
    });
  });

  describe('`blacklist` endpoint', () => {
    it('should verify the JSON response', async () => {
      const blacklistOptions: BlacklistOptions = {
        //confidenceMinimum: 100,
        //onlyCountries: [],
        //exceptCountries: [],
        plaintext: false,
        limit: 1,
      };

      const response = await fetchWrapper(() =>
        client.blacklist(blacklistOptions),
      );

      expect(response).toEqual(blacklistJSONResponse);
    });

    it('should verify the text response', async () => {
      const blacklistOptions: BlacklistOptions = {
        //confidenceMinimum: 100,
        //onlyCountries: [],
        //exceptCountries: [],
        plaintext: true,
        limit: 1,
      };

      const response = await fetchWrapper(() =>
        client.blacklist(blacklistOptions),
      );

      expect(response).toEqual(blacklistTextResponse);
    });
  });

  describe('`report` endpoint', () => {
    it('should verify the default response', async () => {
      const reportOptions: ReportOptions = {
        //comment: 'Please ignore - Automated report generated by abuseipdb-client (https://github.com/arthur-melo/abuseipdb-client)',
      };

      const responses = await Promise.all(
        addresses.map(ip =>
          fetchWrapper(() => client.report(ip, [1], reportOptions)),
        ),
      );

      responses.forEach(response => expect(response).toEqual(reportResponse));
    });

    it('should error on time limit API endpoint', async () => {
      const errorResponse = await fetchWrapper(() =>
        client.report('127.0.0.2', [1]),
      );

      expect(errorResponse).toMatchObject({
        headers: {
          status: 429,
          statusText: 'Too Many Requests',
        },
        result: {
          detail: 'You can only report the same IP address once in 15 minutes.',
          source: { parameter: 'ip', value: '127.0.0.2' },
          status: 429,
        },
      });
    });
  });

  describe('`check-block` endpoint', () => {
    it('should verify valid CIDR response', async () => {
      const checkBlockOptions: CheckBlockOptions = {
        // maxAgeInDays: 30
      };

      const response = await fetchWrapper(() =>
        client.checkBlock('127.0.0.1/24', checkBlockOptions),
      );

      expect(response).toEqual(checkBlockResponse);
    });

    it('should verify invalid CIDR response', async () => {
      const checkBlockOptions: CheckBlockOptions = {
        // maxAgeInDays: 30
      };

      const response = await fetchWrapper(() =>
        client.checkBlock('127.0.0.1/15', checkBlockOptions),
      );

      if (response?.error) {
        const message = response.error.errors[0].detail;
        expect(message).toEqual(
          'Cannot accept bitmask wider than 255.255.0.0 (/16)',
        );
      } else {
        throw response;
      }
    });
  });

  describe('`bulk-report` endpoint', () => {
    it('should verify valid report response', async () => {
      const file = resolve('test', 'data', 'valid-report.csv');

      const response = await fetchWrapper(() => client.bulkReport(file));

      expect(response).toEqual(bulkReportValidResponse);
    });

    it('should verify invalid report response', async () => {
      const file = resolve('test', 'data', 'invalid-report.csv');

      const response = await fetchWrapper(() => client.bulkReport(file));

      expect(response).toEqual(bulkReportInvalidResponse);
    });
  });

  describe('`clear-address` endpoint', () => {
    it('should verify the default response', async () => {
      const responses = await Promise.all(
        addresses.map(ip => fetchWrapper(() => client.clearAddress(ip))),
      );

      responses.forEach(response =>
        expect(response).toEqual(clearAddressResponse),
      );
    });
  });
});
