import type { DocWithErrors } from 'jsonapi-typescript';

/**
 * Utility type, represents a non empty array.
 * @group Helpers
 */
export type NonEmptyArr<T> = [T, ...T[]];

/**
 * Wrapper for IPDB's JSON API error response.
 * This empty interface is used for renaming the DocWithErrors external import.
 * @group AbuseIPDB API Response
 */
export interface APIResponseError extends DocWithErrors {}

/**
 * Client response for parsed IPDB's API endpoints.
 * @group Client Wrapper
 */
export interface ClientResponse<T extends APIResponse> {
  headers: ClientHeaders;
  result?: Extract<APIResponse, T>;
  error?: APIResponseError;
}

/**
 * Wrapper for client headers, includes some of the fetch response fields and API rate limit headers.
 * @group Client Wrapper
 */
export interface ClientHeaders
  extends ClientAPIRateLimitHTTPHeaders,
    ClientFetchResponseHeaders {}

/**
 * IPDB's API rate-limit HTTP headers.
 * @group Client Wrapper
 */
export interface ClientAPIRateLimitHTTPHeaders {
  'retry-after'?: string;
  'x-ratelimit-limit': string;
  'x-ratelimit-remaining': string;
  'x-ratelimit-reset'?: string;
  'x-generated-at'?: string;
}

/**
 * Fetch fields extracted from the API response.
 * @group Client Wrapper
 */
export interface ClientFetchResponseHeaders {
  url: string;
  status: number;
  statusText: string;
}

/**
 * Union of all IPDB API responses.
 * @group AbuseIPDB API Response
 */
export type APIResponse =
  | APICheckEndpointResponse
  | APIReportsEndpointResponse
  | APIBlacklistEndpointResponse
  | APIBlacklistEndpointTextResponse
  | APIReportEndpointResponse
  | APICheckBlockEndpointResponse
  | APIBulkReportEndpointResponse
  | APIClearAddressEndpointResponse
  | APIServerErrorResultResponse;

/**
 * AbuseIPDB's Check endpoint JSON structure.
 * @see [Check Endpoint API](https://docs.abuseipdb.com/#check-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APICheckEndpointResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion?: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string | null;
    countryName?: string | null;
    usageType: UsageType;
    isp: string;
    isTor: boolean;
    domain: string | null;
    hostnames: Array<string>;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string; // ISO Date
    reports: Array<ReportsEntity>;
  };
}

/**
 * AbuseIPDB's Reports endpoint JSON structure.
 * @see [Reports Endpoint API](https://docs.abuseipdb.com/#reports-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APIReportsEndpointResponse {
  data: {
    total: number;
    page: number;
    count: number;
    perPage: number;
    lastPage: number;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
    results: Array<ReportsEntity>;
  };
}

/**
 * AbuseIPDB's Blacklist endpoint JSON structure.
 * @see [Blacklist JSON Endpoint API](https://docs.abuseipdb.com/#blacklist-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APIBlacklistEndpointResponse {
  meta: {
    generatedAt: string; // ISO Date
  };
  data: [
    {
      ipAddress: string;
      countryCode: string;
      abuseConfidenceScore: number;
      lastReportedAt: string; // ISO Date
    },
  ];
}

/**
 * AbuseIPDB's Blacklist endpoint text structure.
 * For the blacklist endpoint as plaintext, the `x-generated-at` API header is included, but
 * for keeping consistency over the client wrapped responses, it is moved to the `meta`
 * attribute, and the text body content is wrapped in a `data` attribute.
 * @see [Blacklist Text Endpoint API](https://docs.abuseipdb.com/#plaintext-blacklist)
 * @group AbuseIPDB API Response
 */
export interface APIBlacklistEndpointTextResponse {
  meta: {
    generatedAt: string; // ISO Date
  };
  data: string;
}

/**
 * AbuseIPDB's Report endpoint JSON structure.
 * @see [Report Endpoint API](https://docs.abuseipdb.com/#report-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APIReportEndpointResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
  };
}

/**
 * AbuseIPDB's Check-Block endpoint JSON structure.
 * @see [Check-Block Endpoint API](https://docs.abuseipdb.com/#check-block-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APICheckBlockEndpointResponse {
  data: {
    networkAddress: string;
    netmask: string;
    minAddress: string;
    maxAddress: string;
    numPossibleHosts: number;
    addressSpaceDesc: string;
    reportedAddress: NonEmptyArr<ReportedAddressEntity>;
  };
}

/**
 * AbuseIPDB's Bulk-Report endpoint JSON structure.
 * @see [Bulk-Report Endpoint API](https://docs.abuseipdb.com/#bulk-report-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APIBulkReportEndpointResponse {
  data: {
    savedReports: number;
    invalidReports: Array<InvalidReportsEntity>;
  };
}

/**
 * AbuseIPDB's Clear-Address endpoint JSON structure.
 * @see [Clear-Address Endpoint API](https://docs.abuseipdb.com/#clear-address-endpoint)
 * @group AbuseIPDB API Response
 */
export interface APIClearAddressEndpointResponse {
  data: {
    numReportsDeleted: number;
  };
}

/**
 * AbuseIPDB's Server Error message structure.
 * When a server error occurs (5xx), there's a message string
 * present on the result response structure.
 * This is not the same as the `APIResponseError` object.
 * @group AbuseIPDB API Response
 */
export interface APIServerErrorResultResponse {
  message: string;
}

/**
 * Possible `usageTypes` values as defined by the Check Endpoint documentation.
 * @see [Check Endpoint usageType](https://docs.abuseipdb.com/#check-endpoint)
 * @group AbuseIPDB API Response
 */
export type UsageType =
  | 'Commercial'
  | 'Organization'
  | 'Government'
  | 'Military'
  | 'University/College/School'
  | 'Library'
  | 'Content Delivery Network'
  | 'Fixed Line ISP'
  | 'Mobile ISP'
  | 'Data Center/Web Hosting/Transit'
  | 'Search Engine Spider'
  | 'Reserved';

/**
 * @group AbuseIPDB API Response
 */
export interface ReportsEntity {
  reportedAt: string; // ISO Date
  comment: string;
  categories: NonEmptyArr<ReportCategory>;
  reporterId: number;
  reporterCountryCode: string;
  reporterCountryName: string;
}

/**
 * @group AbuseIPDB API Response
 */
export interface ReportedAddressEntity {
  ipAddress: string;
  numReports: number;
  mostRecentReport: string; // ISO Date
  abuseConfidenceScore: number;
  countryCode: string | null;
}

/**
 * @group AbuseIPDB API Response
 */
export interface InvalidReportsEntity {
  error: string;
  input: string;
  rowNumber: number;
}

/**
 * AbuseIPDB Report Category types.
 * @see [AbuseIPDB Report Categories](https://www.abuseipdb.com/categories)
 * @enum
 * @group AbuseIPDB API Response
 * @example
 * ```typescript
 * import { ReportCategory } from 'abuseipdb-client';
 *
 * // `ReportCategory` enum can be used to populate an array of categories.
 * const categories: Array<ReportCategory> = [
 *   ReportCategory.WebSpam,
 *   ReportCategory.BadWebBot,
 *   ReportCategory.BruteForce,
 * ];
 *
 * // Which translates to:
 * // categories = [ 10, 19, 18 ].
 *
 * // That way, it is possible to call the `report` endpoint using this reference directly:
 * client.report('127.0.0.1', categories);
 * ```
 */
export enum ReportCategory {
  /**
   * Altering DNS records resulting in improper redirection.
   */
  DNSCompromise = 1,
  /**
   * Falsifying domain server cache (cache poisoning).
   */
  DNSPoisoning,
  /**
   * Fraudulent orders.
   */
  FraudOrders,
  /**
   * Participating in distributed denial-of-service (usually part of botnet).
   */
  DDOSAttack,
  /**
   * FTP Brute force attempt.
   */
  FTPBruteForce,
  /**
   * Oversized IP packet.
   */
  PingOfDeath,
  /**
   * Phishing websites and/or email.
   */
  Phishing,
  /**
   * Voice-over-IP fraud.
   */
  FraudVoIP,
  /**
   * Open proxy, open relay, or Tor exit node.
   */
  OpenProxy,
  /**
   * Comment/forum spam, HTTP referer spam, or other CMS spam.
   */
  WebSpam,
  /**
   * Spam email content, infected attachments, and phishing emails. Note: Limit comments to only relevent information (instead of log dumps) and be sure to remove PII if you want to remain anonymous.
   */
  EmailSpam,
  /**
   * CMS blog comment spam.
   */
  BlogSpam,
  /**
   * VPN IP address.
   */
  VPNIP,
  /**
   * Scanning for open ports and vulnerable services.
   */
  PortScan,
  /**
   * General hacking attempt.
   */
  Hacking,
  /**
   * Attempts at SQL injection.
   */
  SQLInjection,
  /**
   * Email sender spoofing.
   */
  Spoofing,
  /**
   * Credential brute-force attacks on webpage logins and services like SSH, FTP, SIP, SMTP, RDP, etc. This category is seperate from DDoS attacks.
   */
  BruteForce,
  /**
   * Webpage scraping (for email addresses, content, etc) and crawlers that do not honor robots.txt. Excessive requests and user agent spoofing can also be reported here.
   */
  BadWebBot,
  /**
   * Host is likely infected with malware and being used for other attacks or to host malicious content. The host owner may not be aware of the compromise. This category is often used in combination with other attack categories.
   */
  ExploitedHost,
  /**
   * Attempts to probe for or exploit installed web applications such as a CMS like WordPress/Drupal, e-commerce solutions, forum software, phpMyAdmin and various other software plugins/solutions.
   */
  WebAppAttack,
  /**
   * Secure Shell (SSH) abuse. Use this category in combination with more specific categories.
   */
  SSH,
  /**
   * Abuse was targeted at an "Internet of Things" type device. Include information about what type of device was targeted in the comments.
   */
  IOTTargeted,
}
