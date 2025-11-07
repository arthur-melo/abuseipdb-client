import 'jest-extended';

import { AbuseIPDBClient } from '../../lib/index.js';

describe('AbuseIPDBClient Unit Tests', () => {
  let client: AbuseIPDBClient;

  const validIP = '127.0.0.1';

  beforeAll(() => {
    client = new AbuseIPDBClient('FAKE_API_KEY');
  });

  describe('`check` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(client.check('Invalid IP')).rejects.toThrow(
        'Must be a valid IPv4/IPv6 Address',
      );

      expect(
        client.check(validIP, {
          maxAgeInDays: -1,
        }),
      ).rejects.toThrow('Too small: expected number to be >=1');

      expect(
        client.check(validIP, {
          maxAgeInDays: 366,
        }),
      ).rejects.toThrow('Too big: expected number to be <=365');
    });
  });

  describe('`reports` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(client.reports('Invalid IP')).rejects.toThrow(
        'Must be a valid IPv4/IPv6 Address',
      );

      expect(
        client.reports(validIP, {
          maxAgeInDays: -1,
          page: -1,
          perPage: -1,
        }),
      ).rejects.toThrow('Too small: expected number to be >=1');

      expect(
        client.reports(validIP, {
          maxAgeInDays: 366,
        }),
      ).rejects.toThrow('Too big: expected number to be <=365');

      expect(
        client.reports(validIP, {
          perPage: 101,
        }),
      ).rejects.toThrow('Too big: expected number to be <=100');
    });
  });

  describe('`blacklist` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(
        client.blacklist({
          confidenceMinimum: 24,
        }),
      ).rejects.toThrow('Too small: expected number to be >=25');

      expect(
        client.blacklist({
          limit: -1,
        }),
      ).rejects.toThrow('Too small: expected number to be >=1');

      expect(
        client.blacklist({
          confidenceMinimum: 101,
        }),
      ).rejects.toThrow('Too big: expected number to be <=100');

      expect(
        client.blacklist({
          limit: 500001,
        }),
      ).rejects.toThrow('Too big: expected number to be <=500000');

      expect(
        client.blacklist({
          onlyCountries: ['US'],
          exceptCountries: ['BR'],
        }),
      ).rejects.toThrow(
        '`exceptCountries` and `onlyCountries` are mutually exclusive, only one can be defined at a time.',
      );

      expect(
        client.blacklist({
          onlyCountries: ['Not valid ISO (onlyCountries)'],
        }),
      ).rejects.toThrow(
        '[onlyCountries] Countries must be valid ISO 3166-1 Alpha-2 codes.',
      );

      expect(
        client.blacklist({
          exceptCountries: ['Not valid ISO (exceptCountries)'],
        }),
      ).rejects.toThrow(
        '[exceptCountries] Countries must be valid ISO 3166-1 Alpha-2 codes.',
      );

      expect(
        client.blacklist({
          onlyCountries: [],
        }),
      ).rejects.toThrow(
        '[onlyCountries] Atleast one country must be specified.',
      );

      expect(
        client.blacklist({
          exceptCountries: [],
        }),
      ).rejects.toThrow(
        '[exceptCountries] Atleast one country must be specified.',
      );
    });
  });

  describe('`report` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(client.report('Invalid IP', [1])).rejects.toThrow(
        'Must be a valid IPv4/IPv6 Address',
      );

      expect(client.report(validIP, [])).rejects.toThrow(
        'Too small: expected array to have >=1 items',
      );

      expect(client.report(validIP, Array(30 + 1).fill(1))).rejects.toThrow(
        'Too big: expected array to have <=30 items',
      );

      expect(
        client.report(validIP, [1], { comment: Array(1025 + 1).toString() }),
      ).rejects.toThrow('Too big: expected string to have <=1024 characters');
    });
  });

  describe('`check-block` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(client.checkBlock('Invalid IP')).rejects.toThrow(
        'Must be a valid CIDR block',
      );

      const validCIDR = '127.0.0.0/24';

      expect(
        client.checkBlock(validCIDR, { maxAgeInDays: -1 }),
      ).rejects.toThrow('Too small: expected number to be >=1');

      expect(
        client.checkBlock(validCIDR, { maxAgeInDays: 366 }),
      ).rejects.toThrow('Too big: expected number to be <=365');
    });
  });

  describe('`bulk-report` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(client.bulkReport('Invalid path')).rejects.toThrow(
        "ENOENT: no such file or directory, open 'Invalid path'",
      );
    });
  });

  describe('`clear-address` schema', () => {
    it('should throw on invalid input.', async () => {
      expect(client.clearAddress('Invalid IP')).rejects.toThrow(
        'Must be a valid IPv4/IPv6 Address',
      );
    });
  });
});
