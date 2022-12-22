<br>

<p align="center">
  <img src="./public/logo.svg" height="140">
</p>
<h1 align="center">
  abuseipdb-client
</h1>

![License](https://img.shields.io/github/license/arthur-melo/abuseipdb-client)
[![codecov](https://codecov.io/gh/arthur-melo/abuseipdb-client/branch/main/graph/badge.svg?token=M6BA5MDD1V)](https://codecov.io/gh/arthur-melo/abuseipdb-client)
![npm](https://img.shields.io/npm/dw/abuseipdb-client)
![npm](https://img.shields.io/npm/v/abuseipdb-client)
![Workflow](https://github.com/arthur-melo/abuseipdb-client/actions/workflows/ci.yml/badge.svg)

Unofficial [AbuseIPDB](https://www.abuseipdb.com/) Node.js client library.

## Features

- Implements [API v2](https://docs.abuseipdb.com/)
- Built with [TypeScript](https://www.typescriptlang.org/)
- Runtime type checking (Using [Zod](https://zod.dev/))
- Promise API
- ESM and CJS builds

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [About](#about)
4. [API](#api)
5. [Examples](#examples)
6. [Running tests](#running-tests)
7. [Browser Support](#browser-support)
8. [License](#license)

## Installation

```bash
$ npm install -S abuseipdb-client
```

## Usage

```typescript
import { AbuseIPDBClient } from 'abuseipdb-client';

const client = new AbuseIPDBClient('API_KEY');

const response = await client.check('127.0.0.1', { maxAgeInDays: 15 });

console.log(response);
```

<details open>
  <summary>Output</summary>

```typescript
{
  headers: {
    url: 'https://api.abuseipdb.com/api/v2/check?ipAddress=127.0.0.1&maxAgeInDays=15',
    status: 200,
    statusText: 'OK',
    'x-ratelimit-limit': '3000',
    'x-ratelimit-remaining': '2999'
  },
  result: {
    data: {
      ipAddress: '127.0.0.1',
      isPublic: false,
      ipVersion: 4,
      // ...
    }
  }
}
```

</details>

## About

This library wraps API responses into a single object, providing a standard structure.

```typescript
const response = await client.check('127.0.0.1');

const { headers, result, error } = response;
```

The `headers` structure contains the [AbuseIPDB HTTP headers](https://docs.abuseipdb.com/#api-daily-rate-limits) plus some of the [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) information.

```typescript
headers: {
  url: string;
  status: string;
  statusText: string;
  'x-ratelimit-limit': string;
  'x-ratelimit-remaining': string;
  'retry-after'?: string;
  'x-ratelimit-reset'?: string;
}
```

The `error` structure wraps a [JSON-API compliant object](https://jsonapi.org/format/#error-objects), as defined by the [docs](https://docs.abuseipdb.com/#error-handling).

```typescript
error?: {
  errors?: [
    {
      detail?: string;
      status?: number;
      source?: {
        parameter: string
      }
    }
  ]
}
```

The `result` structure wraps the API endpoint response.

```typescript
result?: APIResponse<T>
```

The `headers` object is always populated with the data returned from the API. `result` and `error` are <u>exclusive</u>, either one of them is defined for a given response.

```typescript
const response = await client.check('127.0.0.1');

const { headers, result, error } = response;

if (error) {
  // API returned some error message.
  console.log(error);
}

if (result) {
  // API returned a result response.
  console.log(result);
}

// Headers are defined either way.
console.log(headers);
```

A more detailed explanation can be found at: [examples/abstraction.ts](https://github.com/arthur-melo/abuseipdb-client/tree/main/examples/abstraction.ts).

## API

See [API Docs](https://arthur-melo.github.io/abuseipdb-client/)

## Examples

See [Examples](https://github.com/arthur-melo/abuseipdb-client/tree/main/examples)

## Running tests

In order to run tests, you will need to create an API Key from AbuseIPDB's dashboard.

Then, clone this repo:

```bash
$ git clone https://github.com/arthur-melo/abuseipdb-client
```

Copy the `.env.example` file to `.env`, modifying it with your generated API Key.

Install dependencies:

```bash
$ npm install
```

And run the tests:

```bash
$ npm run test
```

## Browser Support

This project was built using libraries that allow browser usage, but as of this commit, AbuseIPDB doesn't support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

This limits how you can interact with the API, given that you need a proxy server in order to contact the service.

I'm not generating browser bundles at the moment, but I decided to keep the supporting code nevertheless.

I'll keep an eye whether the team behind AbuseIPDB adds support for this use case in the future.

## License

abuseipdb-client is released under the [MIT license](https://github.com/arthur-melo/abuseipdb-client/blob/main/LICENSE).
