import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Update this if your backend is on a different port

function App() {
  const [token, setToken] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);

  const handleTokenSubmit = async () => {
    try {
      await axios.post(`${API_URL}/github-token`, { token });
      setTokenSaved(true);
      setError('GitHub token saved successfully');
    } catch (err) {
      setError('Failed to set GitHub token');
      setTokenSaved(false);
    }
  };

  const handleCrawl = async () => {
    if (!tokenSaved) {
      setError('Please save your GitHub token first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/crawl`, { query });
      setResults(response.data);
    } catch (err) {
      setError('Failed to crawl GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">GitHub Crawler</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="token">
          GitHub Token
        </label>
        <input
          id="token"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          type="text"
          placeholder="Enter your GitHub token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleTokenSubmit}
        >
          Set Token
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="query">
          Search Query
        </label>
        <input
          id="query"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          type="text"
          placeholder="e.g - OPENAI_API_KEY=sk-"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={`${
            tokenSaved
              ? 'bg-green-500 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          onClick={handleCrawl}
          disabled={loading || !tokenSaved}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : null}
          {loading ? 'Crawling...' : 'Crawl GitHub'}
        </button>
      </div>

      {error && (
        <div className={`border px-4 py-3 rounded relative mb-6 ${
          error.includes('successfully') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
        }`} role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          {results.map((result, index) => (
            <div key={index} className="border-b border-gray-200 py-4 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{result.repo}</span>
                <span className="text-sm text-gray-600">{result.file}</span>
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700 break-all"
              >
                {result.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;