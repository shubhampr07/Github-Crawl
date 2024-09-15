// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 8000;

// app.use(cors());
// app.use(express.json());

// let githubToken = '';

// app.post('/github-token', (req, res) => {
//   const { token } = req.body;
//   if (!token) {
//     return res.status(400).send('GitHub token is required');
//   }
//   githubToken = token;
//   res.send('GitHub token saved successfully');
// });

// async function fetchResults(searchQuery) {
//   const headers = {
//     Authorization: `token ${githubToken}`,
//   };

//   const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=5`;

//   const seenResults = new Set();
//   const results = [];

//   try {
//     let nextUrl = searchUrl;
//     while (nextUrl) {
//       const response = await axios.get(nextUrl, { headers });

//       if (response.status !== 200) {
//         throw new Error(`GitHub API error: ${response.status}`);
//       }

//       const items = response.data.items || [];

//       for (const item of items) {
//         const { repository, path, html_url, url } = item;

//         const fileResponse = await axios.get(url, { headers });

//         if (fileResponse.status === 200) {
//           const decodedContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');

//           if (decodedContent.includes(searchQuery)) {
//             const result = {
//               repo: repository.full_name,
//               file: path,
//               url: html_url,
//             };

//             const resultStr = JSON.stringify(result);
//             if (!seenResults.has(resultStr)) {
//               seenResults.add(resultStr);
//               results.push(result);
//             }
//           }
//         }
//       }

//       nextUrl = getNextPageUrl(response.headers.link);
//     }

//     console.log('Crawling complete.');
//     return results;
//   } catch (error) {
//     console.error('Error during crawling:', error.message);
//     throw error;
//   }
// }

// function getNextPageUrl(linkHeader) {
//   if (!linkHeader) return null;
//   const links = linkHeader.split(',');
//   for (const link of links) {
//     const match = link.match(/<([^>]+)>;\s*rel="next"/);
//     if (match) {
//       return match[1];
//     }
//   }
//   return null;
// }

// app.post('/crawl', async (req, res) => {
//   try {
//     if (!githubToken) {
//       return res.status(400).send('GitHub token is not set');
//     }

//     const { query } = req.body;
//     if (!query) {
//       return res.status(400).send('Search query is required');
//     }

//     const results = await fetchResults(query);
//     res.json(results);
//   } catch (error) {
//     res.status(500).send('Error during crawling');
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

let githubToken = '';

app.post('/github-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send('GitHub token is required');
  }
  githubToken = token;
  res.send('GitHub token saved successfully');
});

async function fetchResults(searchQuery) {
  const headers = {
    Authorization: `token ${githubToken}`,
    'User-Agent': 'GitHub-Crawler-App'  // Add a User-Agent header
  };

  const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=5`;

  const seenResults = new Set();
  const results = [];

  try {
    let nextUrl = searchUrl;
    while (nextUrl) {
      const response = await axios.get(nextUrl, { headers });

      if (response.status !== 200) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const items = response.data.items || [];

      for (const item of items) {
        const { repository, path, html_url, url } = item;

        const fileResponse = await axios.get(url, { headers });

        if (fileResponse.status === 200) {
          const decodedContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');

          if (decodedContent.includes(searchQuery)) {
            const result = {
              repo: repository.full_name,
              file: path,
              url: html_url,
            };

            const resultStr = JSON.stringify(result);
            if (!seenResults.has(resultStr)) {
              seenResults.add(resultStr);
              results.push(result);
            }
          }
        }
      }

      nextUrl = getNextPageUrl(response.headers.link);
    }

    console.log('Crawling complete.');
    return results;
  } catch (error) {
    console.error('Error during crawling:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}

function getNextPageUrl(linkHeader) {
  if (!linkHeader) return null;
  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

app.post('/crawl', async (req, res) => {
  try {
    if (!githubToken) {
      return res.status(400).send('GitHub token is not set');
    }

    const { query } = req.body;
    if (!query) {
      return res.status(400).send('Search query is required');
    }

    const results = await fetchResults(query);
    res.json(results);
  } catch (error) {
    console.error('Error in /crawl endpoint:', error);
    res.status(500).json({
      message: 'Error during crawling',
      error: error.message,
      details: error.response ? {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      } : null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});