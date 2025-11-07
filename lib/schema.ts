import { z } from 'zod';
import isIP from 'validator/lib/isIP.js';
import isIPRange from 'validator/lib/isIPRange.js';

import { isArrISO31661Alpha2 } from './validators.js';

const abuseIPDBClientRequiredSchema = z.object({
  /** Client API Key, must be generated at AbuseIPDB's client dashboard. */
  apiKey: z.string().min(1),
});

const abuseIPDBClientOptionsSchema = z.object({
  /**
   * Overrides the default AbuseIPDB base API url, can be used to proxy client requests.
   * @defaultValue `https://api.abuseipdb.com/api/v2`
   */
  url: z.string().optional(),
});

/**
 * AbuseIPDBClient instance optional parameters.
 * @group Input - Optional Parameter
 */
interface AbuseIPDBClientOptions
  extends z.TypeOf<typeof abuseIPDBClientOptionsSchema> {}

/**
 * @group Input - Validator
 */
const abuseIPDBClientSchema = abuseIPDBClientRequiredSchema.extend(
  abuseIPDBClientOptionsSchema.shape,
);

const abuseIPDBClientConfigSchema = z.object({
  /** Client API Key. */
  apiKey: z.string(),
  /**
   * Base API URL.
   * @defaultValue `https://api.abuseipdb.com/api/v2`
   */
  url: z.string(),
});

/**
 * AbuseIPDBClient instance configuration variables.
 * @group Client
 */
interface AbuseIPDBClientConfig
  extends z.TypeOf<typeof abuseIPDBClientConfigSchema> {}

const checkRequiredSchema = z.object({
  /** Single IPv4/IPv6 address. */
  ipAddress: z
    .string()
    .refine(isIP, { message: 'Must be a valid IPv4/IPv6 Address' }),
});

const checkOptionsSchema = z.object({
  /** Show latest reports based on `n` days. Accepted values between 1 and 365, defaults to `30` by the API. */
  maxAgeInDays: z.number().int().min(1).max(365).optional(),
  /** Includes in the client response all the reports (Limited to 10,000) and country name entries, based on the `maxAgeInDays` parameter. Defaults to `false` by the API. */
  verbose: z.boolean().optional(),
});

/**
 * Check endpoint optional parameters.
 * @group Input - Optional Parameter
 */
interface CheckOptions extends z.TypeOf<typeof checkOptionsSchema> {}

/**
 * @group Input - Validator
 */
const checkSchema = checkRequiredSchema
  .extend(checkOptionsSchema.shape)
  .transform(schema => {
    /**
     * Removes a boolean query string parameter when its value is set to `false`.
     * Currently, the AbuseIPDB's API treats boolean query strings as `true` regardless of its value,
     * this function filter those values in order to return the right response.
     * The `Check` and `Blacklist` as text endpoints have such booleans.
     */
    const newSchema = { ...schema };
    if (schema['verbose'] === false) {
      delete newSchema['verbose'];
    }

    return newSchema;
  });

const reportsRequiredSchema = z.object({
  /** Single IPv4/IPv6 address. */
  ipAddress: z
    .string()
    .refine(isIP, { message: 'Must be a valid IPv4/IPv6 Address' }),
});

const reportsOptionsSchema = z.object({
  /** Show latest reports based on `n` days. Accepted values between 1 and 365, defaults to `30` by the API. */
  maxAgeInDays: z.number().int().min(1).max(365).optional(),

  /** Pagination number based on the `perPage` parameter. Minimum accepted value is 1, defaults to `1` by the API. */
  page: z.number().int().min(1).optional(),

  /** Amount of reports per page. Accepted values between 1 and 100, defaults to `25` by the API. */
  perPage: z.number().int().min(1).max(100).optional(),
});

/**
 * Reports endpoint optional parameters.
 * @group Input - Optional Parameter
 */
interface ReportsOptions extends z.infer<typeof reportsOptionsSchema> {}

/**
 * @group Input - Validator
 */
const reportsSchema = reportsRequiredSchema.extend(reportsOptionsSchema.shape);

const blacklistOptionsSchema = z.object({
  /** Minimum confidence percentage value. Accepted values between 25 and 100, defaults to `100` by the API. Requires a subscription to use this feature.   */
  confidenceMinimum: z.number().int().min(25).max(100).optional(),
  /**
   * Limits the amount of returned reports. Accepted values between 1 and 500000, defaults to `10000` by the API.
   * The value is capped by your current subscription tier. (10k Standard, 100k Basic, 500k Premium).
   */
  limit: z.number().int().min(1).max(500000).optional(),
  /** Returns the response as a text list, instead of JSON structure. Result is wrapped in a `ClientResponse` */
  plaintext: z.boolean().optional(),

  /**
   * Filters the reports based on a given array of ISO 3166-1 Alpha-2 countries, including only the given list.
   * Requires a subscription to use this feature.
   * `onlyCountries` and `exceptCountries` are mutually exclusive, only one can be defined at a time. */
  onlyCountries: z.array(z.string()).optional(),

  /**
   * Filters the reports based on a given array of ISO 3166-1 Alpha-2 countries, excluding only the given list.
   * Requires a subscription to use this feature.
   * `onlyCountries` and `exceptCountries` are mutually exclusive, only one can be defined at a time. */
  exceptCountries: z.array(z.string()).optional(),
});

/**
 * @group Input - Validator
 */
const blacklistSchema = blacklistOptionsSchema
  .transform(schema => {
    /**
     * Removes a boolean query string parameter when its value is set to `false`.
     * Currently, the AbuseIPDB's API treats boolean query strings as `true` regardless of its value,
     * this function filter those values in order to return the right response.
     * The `Check` and `Blacklist` as text endpoints have such booleans.
     */
    const newSchema = { ...schema };
    if (schema['plaintext'] === false) {
      delete newSchema['plaintext'];
    }

    return newSchema;
  })
  .superRefine((schemaValues: z.infer<typeof blacklistOptionsSchema>, ctx) => {
    // Countries declaration are optional, skip validation if this is the case.
    if (!(schemaValues.onlyCountries ?? schemaValues.exceptCountries)) {
      return;
    }

    if (schemaValues.onlyCountries && schemaValues.exceptCountries) {
      ctx.addIssue({
        code: 'custom',
        message:
          '`exceptCountries` and `onlyCountries` are mutually exclusive, only one can be defined at a time.',
      });
      return;
    }

    const countriesParams = ['onlyCountries', 'exceptCountries'];

    for (const countryParam of countriesParams) {
      const countriesArr = schemaValues[
        countryParam as keyof typeof schemaValues
      ] as Array<string> | undefined;

      if (!countriesArr) {
        continue;
      }

      if (countriesArr.length === 0) {
        ctx.addIssue({
          code: 'too_small',
          origin: 'number',
          minimum: 1,
          inclusive: true,
          message: `[${countryParam}] Atleast one country must be specified.`,
        });

        continue;
      }

      if (!isArrISO31661Alpha2(countriesArr)) {
        ctx.addIssue({
          code: 'custom',
          message: `[${countryParam}] Countries must be valid ISO 3166-1 Alpha-2 codes.`,
        });
      }
    }
  });

/**
 * Blacklist endpoint optional parameters.
 * @group Input - Optional Parameter
 */
interface BlacklistOptions extends z.TypeOf<typeof blacklistOptionsSchema> {}

const reportRequiredSchema = z.object({
  /** Single IPv4/IPv6 address. */
  ip: z.string().refine(isIP, { message: 'Must be a valid IPv4/IPv6 Address' }),
  /** Array of categories */
  categories: z.array(z.number().int().min(1).max(23)).min(1).max(30),
});

const reportOptionsSchema = z.object({
  /** Message to be added to the report, limited to 1024 characters. */
  comment: z.string().max(1024).optional(),
});

/**
 * Report endpoint optional parameters.
 * @group Input - Optional Parameter
 */
interface ReportOptions extends z.TypeOf<typeof reportOptionsSchema> {}

/**
 * @group Input - Validator
 */
const reportSchema = reportRequiredSchema.extend(reportOptionsSchema.shape);

const checkBlockRequiredSchema = z.object({
  /**
   * Single IPv4/IPv6 address block in CIDR format.
   * The value is capped by your current subscription tier. (Up to /24 on Standard, /20 on Basic, /16 on Premium).
   */
  network: z
    .string()
    .refine(isIPRange, { message: 'Must be a valid CIDR block' }),
});

const checkBlockOptionsSchema = z.object({
  /**
   * Show latest reports based on `n` days. Accepted values between 1 and 365, defaults to `30` by the API.
   * The value is capped by your current subscription tier. (Up to 30 on Standard, 60 on Basic, 365 on Premium).
   */
  maxAgeInDays: z.number().int().min(1).max(365).optional(),
});

/**
 * Check-Block endpoint optional parameters.
 * @group Input - Optional Parameter
 */
interface CheckBlockOptions extends z.TypeOf<typeof checkBlockOptionsSchema> {}

/**
 * @group Input - Validator
 */
const checkBlockSchema = checkBlockRequiredSchema.extend(
  checkBlockOptionsSchema.shape,
);

const bulkReportRequiredSchema = z.object({
  /** Report CSV filepath to be sent. */
  csv: z.string(),
});

/**
 * @group Input - Validator
 */
const bulkReportSchema = bulkReportRequiredSchema;

/** Single IPv4/IPv6 address. */
const clearAddressRequiredSchema = z
  .string()
  .refine(isIP, { message: 'Must be a valid IPv4/IPv6 Address' });

/**
 * @group Input - Validator
 */
const clearAddressSchema = z.object({ ipAddress: clearAddressRequiredSchema });

export {
  abuseIPDBClientSchema,
  checkSchema,
  reportsSchema,
  blacklistSchema,
  reportSchema,
  checkBlockSchema,
  bulkReportSchema,
  clearAddressSchema,
};

export type {
  AbuseIPDBClientOptions,
  AbuseIPDBClientConfig,
  CheckOptions,
  ReportsOptions,
  BlacklistOptions,
  ReportOptions,
  CheckBlockOptions,
};
