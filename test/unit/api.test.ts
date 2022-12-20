import 'jest-extended';
import { resolve } from 'node:path';
import fetchMock from 'jest-fetch-mock';

fetchMock.doMock();

import { BASE_URL } from '../../lib/index.js';
import { AbuseIPDBClient } from '../../lib/index.js';

const API_KEY = 'FAKE_API_KEY';

describe('AbuseIPDBClient Unit Tests', () => {
  let client: AbuseIPDBClient;

  const validIP = '127.0.0.1';

  beforeAll(() => {
    client = new AbuseIPDBClient(API_KEY);
  });

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify({ data: 'Mock' }));
  });

  describe('AbuseIPDBClient class', () => {
    it('should instantiate the client with a different URL', () => {
      const url = 'http://localhost:3000';

      const testClient = new AbuseIPDBClient(API_KEY, {
        url,
      });

      const data = {
        apiKey: API_KEY,
        url,
      };

      expect(testClient.getConfig()).toStrictEqual(data);
    });

    it('should return the config data', () => {
      const data = {
        apiKey: API_KEY,
        url: 'https://api.abuseipdb.com/api/v2',
      };

      expect(client.getConfig()).toStrictEqual(data);
    });
  });

  describe('`check` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      await client.check(validIP, {
        maxAgeInDays: 30,
        verbose: true,
      });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/check?ipAddress=${validIP}&maxAgeInDays=30&verbose=true`,
      );
    });

    it('should call the endpoint without the verbose query parameter.', async () => {
      await client.check(validIP, { verbose: false });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/check?ipAddress=${validIP}`,
      );
    });
  });

  describe('`reports` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      await client.reports(validIP, {
        maxAgeInDays: 30,
        page: 10,
        perPage: 50,
      });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/reports?ipAddress=${validIP}&maxAgeInDays=30&page=10&perPage=50`,
      );
    });
  });

  describe('`blacklist` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      await client.blacklist({
        confidenceMinimum: 100,
        plaintext: true,
        onlyCountries: ['US', 'BR', 'JP'],
        limit: 1,
      });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/blacklist?confidenceMinimum=100&limit=1&plaintext=true&onlyCountries=US%2CBR%2CJP`,
      );

      await client.blacklist({
        confidenceMinimum: 100,
        plaintext: true,
        exceptCountries: ['US', 'BR', 'JP'],
        limit: 1,
      });

      expect(fetchMock.mock.calls.length).toEqual(2);
      expect(fetchMock.mock.calls[1][0]).toEqual(
        `${BASE_URL}/blacklist?confidenceMinimum=100&limit=1&plaintext=true&exceptCountries=US%2CBR%2CJP`,
      );
    });

    it('should call the endpoint without the plaintext query parameters.', async () => {
      await client.blacklist({
        plaintext: false,
      });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(`${BASE_URL}/blacklist`);
    });
  });

  describe('`report` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      await client.report(validIP, [1, 2, 3], {
        comment: 'Test',
      });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/report?ip=${validIP}&categories=1%2C2%2C3&comment=Test`,
      );
    });
  });

  describe('`check-block` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      const validNetwork = '127.0.0.0/24';

      await client.checkBlock(validNetwork, {
        maxAgeInDays: 30,
      });

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/check-block?network=127.0.0.0%2F24&maxAgeInDays=30`,
      );
    });
  });

  describe('`bulk-report` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      const file = resolve('test', 'data', 'valid-report.csv');

      await client.bulkReport(file);

      // FetchMock doesn't support FormData, checking only route/method.
      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(`${BASE_URL}/bulk-report`);
      expect(fetchMock.mock.calls[0][1]?.method).toEqual('POST');
    });
  });

  describe('`clear-address` endpoint', () => {
    it('should call the endpoint with the supplied query parameters.', async () => {
      await client.clearAddress(validIP);

      expect(fetchMock.mock.calls.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${BASE_URL}/clear-address?ipAddress=${validIP}`,
      );
    });
  });
});
