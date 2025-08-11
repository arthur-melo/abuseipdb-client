// Client library:
// Headers
const headers = {
  url: expect.any(String),
  status: expect.any(Number),
  statusText: expect.any(String),
  'retry-after': expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
  'x-ratelimit-limit': expect.any(String),
  'x-ratelimit-remaining': expect.any(String),
  'x-ratelimit-reset': expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
};

// Error object, Follows JSON-API specification (Not fully represented here).
const error = {
  errors: expect.arrayContaining([
    {
      detail: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
      status: expect.toBeOneOf([expect.toBeNil(), expect.any(Number)]),
      source: expect.toBeOneOf([
        expect.toBeNil(),
        { parameter: expect.any(String) },
      ]),
    },
  ]),
};

// Wrapper for the library response.
const libraryResponseWrapper = (data: unknown) => ({
  headers,
  error: expect.toBeOneOf([expect.toBeNil(), error]),
  result: expect.toBeOneOf([
    expect.toBeNil(),
    data,
    {
      detail: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
      source: {
        parameter: expect.any(String),
        value: expect.any(String),
      },
      status: expect.any(Number),
    },
  ]),
});

// Endpoint responses:
const checkResponse = libraryResponseWrapper({
  data: {
    ipAddress: expect.any(String),
    isPublic: expect.any(Boolean),
    ipVersion: expect.any(Number),
    isWhitelisted: expect.toBeOneOf([expect.toBeNil(), expect.any(Boolean)]),
    abuseConfidenceScore: expect.any(Number),
    countryCode: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    countryName: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    usageType: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    isp: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    isTor: expect.toBeBoolean(),
    domain: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    hostnames: expect.toBeOneOf([
      expect.toBeEmpty(),
      expect.arrayContaining([expect.any(String)]),
    ]),
    totalReports: expect.any(Number),
    numDistinctUsers: expect.any(Number),
    lastReportedAt: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    reports: expect.toBeOneOf([
      expect.toBeNil(),
      expect.toBeEmpty(),
      expect.arrayContaining([
        {
          categories: expect.arrayContaining([expect.any(Number)]),
          comment: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
          reportedAt: expect.any(String),
          reporterCountryCode: expect.any(String),
          reporterCountryName: expect.any(String),
          reporterId: expect.any(Number),
        },
      ]),
    ]),
  },
});

const reportsResponse = libraryResponseWrapper({
  data: {
    total: expect.any(Number),
    page: expect.any(Number),
    count: expect.any(Number),
    perPage: expect.any(Number),
    lastPage: expect.any(Number),
    nextPageUrl: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    previousPageUrl: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
    results: expect.toBeOneOf([
      expect.toBeEmpty(),
      expect.arrayContaining([
        {
          reportedAt: expect.any(String),
          comment: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
          categories: expect.arrayContaining([expect.any(Number)]),
          reporterId: expect.any(Number),
          reporterCountryCode: expect.any(String),
          reporterCountryName: expect.any(String),
        },
      ]),
    ]),
  },
});

const blacklistJSONResponse = libraryResponseWrapper({
  meta: {
    generatedAt: expect.any(String),
  },
  data: expect.arrayContaining([
    {
      ipAddress: expect.any(String),
      countryCode: expect.any(String),
      abuseConfidenceScore: expect.any(Number),
      lastReportedAt: expect.any(String),
    },
  ]),
});

const blacklistTextResponse = libraryResponseWrapper({
  meta: {
    generatedAt: expect.any(String),
  },
  data: expect.any(String),
});

const reportResponse = libraryResponseWrapper({
  data: {
    ipAddress: expect.any(String),
    abuseConfidenceScore: expect.any(Number),
  },
});

const checkBlockResponse = libraryResponseWrapper({
  data: {
    networkAddress: expect.any(String),
    netmask: expect.any(String),
    minAddress: expect.any(String),
    maxAddress: expect.any(String),
    numPossibleHosts: expect.any(Number),
    addressSpaceDesc: expect.any(String),
    reportedAddress: expect.toBeOneOf([
      expect.toBeEmpty(),
      expect.arrayContaining([
        {
          ipAddress: expect.any(String),
          numReports: expect.any(Number),
          mostRecentReport: expect.any(String),
          countryCode: expect.toBeOneOf([expect.toBeNil(), expect.any(String)]),
          abuseConfidenceScore: expect.any(Number),
        },
      ]),
    ]),
  },
});

const bulkReportValidResponse = libraryResponseWrapper({
  data: {
    savedReports: expect.any(Number),
    invalidReports: expect.toBeEmpty(),
  },
});

const bulkReportInvalidResponse = libraryResponseWrapper({
  data: {
    savedReports: expect.any(Number),
    invalidReports: expect.arrayContaining([
      {
        error: expect.any(String),
        input: expect.any(String),
        rowNumber: expect.any(Number),
      },
    ]),
  },
});

const clearAddressResponse = libraryResponseWrapper({
  data: {
    numReportsDeleted: expect.any(Number),
  },
});

export {
  checkResponse,
  reportsResponse,
  blacklistJSONResponse,
  blacklistTextResponse,
  reportResponse,
  checkBlockResponse,
  bulkReportValidResponse,
  bulkReportInvalidResponse,
  clearAddressResponse,
};
