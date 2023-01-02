import unfetch from 'isomorphic-unfetch';
import { fileFromSync } from 'fetch-blob/from.js';
import { FormData } from 'formdata-polyfill/esm.min.js';
import { z } from 'zod';

import {
  ClientResponse,
  APIResponse,
  APIResponseError,
  ClientHeaders,
  APICheckEndpointResponse,
  APIBlacklistEndpointResponse,
  APIBlacklistEndpointTextResponse,
  APIBulkReportEndpointResponse,
  APICheckBlockEndpointResponse,
  APIClearAddressEndpointResponse,
  APIReportEndpointResponse,
  APIReportsEndpointResponse,
  ReportCategory,
  ClientAPIRateLimitHTTPHeaders,
} from './types.js';

import type {
  AbuseIPDBClientOptions,
  AbuseIPDBClientConfig,
  CheckOptions,
  ReportsOptions,
  BlacklistOptions,
  ReportOptions,
  CheckBlockOptions,
} from './schema.js';

import {
  abuseIPDBClientSchema,
  checkSchema,
  reportSchema,
  blacklistSchema,
  reportsSchema,
  checkBlockSchema,
  bulkReportSchema,
  clearAddressSchema,
} from './schema.js';

import { BASE_URL } from './constants.js';

/**
 * @internal
 * @group Internal
 */
export type EndpointURIS =
  | 'check'
  | 'reports'
  | 'blacklist'
  | 'report'
  | 'check-block'
  | 'bulk-report'
  | 'clear-address';

type Endpoints<T extends z.ZodTypeAny> = {
  [key in EndpointURIS]: {
    method: 'GET' | 'POST' | 'DELETE';
    schema: T;
  };
};

const ENDPOINTS: Endpoints<z.ZodTypeAny> = {
  check: {
    method: 'GET',
    schema: checkSchema,
  },
  reports: {
    method: 'GET',
    schema: reportsSchema,
  },
  blacklist: {
    method: 'GET',
    schema: blacklistSchema,
  },
  report: {
    method: 'POST',
    schema: reportSchema,
  },
  'check-block': {
    method: 'GET',
    schema: checkBlockSchema,
  },
  'bulk-report': {
    method: 'POST',
    schema: bulkReportSchema,
  },
  'clear-address': {
    method: 'DELETE',
    schema: clearAddressSchema,
  },
};

/**
 * @internal
 * @group Internal
 */
export type ClientAPIHeaders = { Key: string; Accept: string };

/**
 * @group Client
 */
class AbuseIPDBClient {
  #headers!: ClientAPIHeaders;
  #apiKey!: string;
  #url!: string;

  /**
   * Creates a new AbuseIPDB client, requires an API key from AbuseIPDB's dashboard.
   * @param apiKey AbuseIPDB client API key.
   * @param options Optional parameters - {@link AbuseIPDBClientOptions}
   */
  constructor(apiKey: string, options?: AbuseIPDBClientOptions) {
    const params = { apiKey, ...options };
    const validatedParams = this.#validateData(params, abuseIPDBClientSchema);

    this.#apiKey = validatedParams.apiKey;
    this.#setHeaders(validatedParams.apiKey);

    if (validatedParams?.url) {
      this.#url = validatedParams.url;
      return;
    }

    this.#url = BASE_URL;
  }

  /**
   * Returns the current client config.
   */
  getConfig(): AbuseIPDBClientConfig {
    return {
      apiKey: this.#apiKey,
      url: this.#url,
    };
  }

  #setHeaders(apiKey: string): void {
    this.#headers = {
      Key: apiKey,
      Accept: 'application/json',
    };
  }

  #buildResponseHeaders(response: unfetch.IsomorphicResponse): ClientHeaders {
    const headersJson: Partial<ClientHeaders> = {};

    // From fetch response.
    headersJson.url = response.url;
    headersJson.status = response.status;
    headersJson.statusText = response.statusText;

    // From AbuseIPDB API HTTP headers.
    const rateLimitKeys: Array<keyof ClientAPIRateLimitHTTPHeaders> = [
      'retry-after',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-generated-at',
    ];

    for (const key of rateLimitKeys) {
      const value = response.headers.get(key);
      if (value) {
        headersJson[key] = value;
      }
    }

    return headersJson as ClientHeaders;
  }

  async #formatResponse<T extends APIResponse>(
    fetchAPIResponse: unfetch.IsomorphicResponse,
  ): Promise<ClientResponse<T>> {
    const headers = this.#buildResponseHeaders(fetchAPIResponse);

    let formattedResponse: ClientResponse<T>;

    /**
     * The `x-generated-at` header is present on blacklist API text endpoint response, it
     * is formatted here to keep consistency.
     * @see {@link APIBlacklistEndpointTextResponse}
     */
    if (headers['x-generated-at']) {
      const xGeneratedAt = headers['x-generated-at'] as string;
      delete headers['x-generated-at'];

      const bodyWithMeta: APIBlacklistEndpointTextResponse = {
        meta: {
          generatedAt: xGeneratedAt,
        },
        data: await fetchAPIResponse.text(),
      };

      formattedResponse = {
        headers,
        result: bodyWithMeta,
      } as ClientResponse<T>;
    } else {
      const body = await fetchAPIResponse.json();
      if ((body as APIResponseError).errors) {
        formattedResponse = { headers, error: body as APIResponseError };
      } else {
        formattedResponse = {
          headers,
          result: body as Extract<APIResponse, T>,
        };
      }
    }

    return formattedResponse;
  }

  async #requestData(
    url: string,
    method: string,
    headers: HeadersInit,
    body?: BodyInit,
  ) {
    return fetch(url, {
      method,
      headers,
      body,
    });
  }

  #formatRequestBulkReport(
    headers: ClientAPIHeaders,
    data: z.infer<typeof bulkReportSchema>,
  ) {
    const { csv } = data;

    const file = fileFromSync(csv);

    const formData = new FormData();

    formData.append('csv', file);

    return {
      headers,
      body: formData,
    };
  }

  #formatUrl<T extends z.ZodTypeAny>(uri: string, params?: z.infer<T>): string {
    const url = new URL(`${this.#url}/${uri}`);

    for (const key of Object.keys(params ?? {})) {
      url.searchParams.append(key, params?.[key]);
    }

    return url.href;
  }

  #validateData<T, U extends z.ZodTypeAny>(
    parameters: T,
    schema: U,
  ): z.infer<typeof schema> | never {
    const result = schema.safeParse(parameters);

    if (!result.success) {
      throw result.error;
    } else {
      return result.data;
    }
  }

  async #handleRequest<T extends APIResponse>(
    endpointURI: EndpointURIS,
    parameters: unknown,
  ): Promise<ClientResponse<T>> {
    const { method, schema } = ENDPOINTS[endpointURI];

    // Validates the input parameters given by the client.
    const validatedInput = this.#validateData(parameters, schema);

    let response: unfetch.IsomorphicResponse;
    if (endpointURI === 'bulk-report') {
      // There is no need to append QueryParams for the bulk-report endpoint, so it is removed here.
      const url = this.#formatUrl(endpointURI);

      const { headers, body } = this.#formatRequestBulkReport(
        this.#headers,
        parameters as z.infer<typeof bulkReportSchema>,
      );

      response = await this.#requestData(url, method, headers, body);
    } else {
      const url = this.#formatUrl(endpointURI, validatedInput);

      response = await this.#requestData(url, method, this.#headers);
    }

    // Transforms the API fetch response to the library format.
    const formattedResponseData = await this.#formatResponse<T>(response);

    return formattedResponseData;
  }

  /**
   * @see [Check API Endpoint](https://docs.abuseipdb.com/#check-endpoint)
   * @param ipAddress Single IPv4/IPv6 address to be verified.
   * @param options Optional parameters - {@link CheckOptions}
   */
  async check(
    ipAddress: string,
    options?: CheckOptions,
  ): Promise<ClientResponse<APICheckEndpointResponse>> {
    return this.#handleRequest<APICheckEndpointResponse>('check', {
      ipAddress,
      ...options,
    });
  }

  /**
   * @see [Reports API Endpoint](https://docs.abuseipdb.com/#reports-endpoint)
   * @param ipAddress Single IPv4/IPv6 address to be verified.
   * @param options Optional parameters - {@link ReportsOptions}
   * @beta
   */
  async reports(
    ipAddress: string,
    options?: ReportsOptions,
  ): Promise<ClientResponse<APIReportsEndpointResponse>> {
    return this.#handleRequest('reports', { ipAddress, ...options });
  }

  /**
   * @see [Blacklist API Endpoint](https://docs.abuseipdb.com/#blacklist-endpoint)
   * @param options Optional parameters - {@link BlacklistOptions}
   */
  async blacklist(
    options?: BlacklistOptions,
  ): Promise<ClientResponse<APIBlacklistEndpointResponse>> {
    return this.#handleRequest('blacklist', { ...options });
  }

  /**
   * @see [Report API Endpoint](https://docs.abuseipdb.com/#report-endpoint)
   * @param ip Single IPv4/IPv6 address to be verified.
   * @param categories Array of categories to be reported.
   * @param options Optional parameters - {@link ReportOptions}
   */
  async report(
    ip: string,
    categories: Array<ReportCategory>,
    options?: ReportOptions,
  ): Promise<ClientResponse<APIReportEndpointResponse>> {
    return this.#handleRequest('report', { ip, categories, ...options });
  }

  /**
   * @see [Check-Block API Endpoint](https://docs.abuseipdb.com/#check-block-endpoint)
   * @param network Single IPv4/IPv6 address block in CIDR format.
   * @param options Optional parameters - {@link CheckBlockOptions}
   */
  async checkBlock(
    network: string,
    options?: CheckBlockOptions,
  ): Promise<ClientResponse<APICheckBlockEndpointResponse>> {
    return this.#handleRequest('check-block', { network, ...options });
  }

  /**
   * @see [Bulk-Report API Endpoint](https://docs.abuseipdb.com/#bulk-report-endpoint)
   * @param csv CSV filepath to be sent.
   */
  async bulkReport(
    csv: string,
  ): Promise<ClientResponse<APIBulkReportEndpointResponse>> {
    return this.#handleRequest('bulk-report', { csv });
  }

  /**
   * @see [Clear-Address API Endpoint](https://docs.abuseipdb.com/#clear-address-endpoint)
   * @param ipAddress Single IPv4/IPv6 address.
   */
  async clearAddress(
    ipAddress: string,
  ): Promise<ClientResponse<APIClearAddressEndpointResponse>> {
    return this.#handleRequest('clear-address', { ipAddress });
  }
}

export { AbuseIPDBClient };
