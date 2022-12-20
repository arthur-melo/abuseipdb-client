import fetchMock from 'jest-fetch-mock';

/**
 * Setup for jest-fetch-mock
 * @see [jest-fetch-mock](https://github.com/jefflau/jest-fetch-mock#to-setup-for-all-tests)
 */
fetchMock.enableMocks();
fetchMock.dontMock();
