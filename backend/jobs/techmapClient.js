import axios from 'axios';

const TECHMAP_API_URL = 'https://job-postings-rss-feed.p.rapidapi.com/jobs';

/**
 * Fetches job postings from Techmap API for specific LATAM countries.
 * Country codes: mx (Mexico), ar (Argentina), co (Colombia), cl (Chile)
 */
export async function fetchTechmapJobs() {
  const apiKey = process.env.RAPIDAPI_TECHMAP_KEY;
  
  if (!apiKey) {
    console.warn('RAPIDAPI_TECHMAP_KEY is missing. Skipping Techmap jobs.');
    return [];
  }

  const countries = ['mx', 'ar', 'co', 'cl'];
  const allJobs = [];

  try {
    for (const country of countries) {
      const response = await axios.get(TECHMAP_API_URL, {
        params: { country },
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'job-postings-rss-feed.p.rapidapi.com'
        }
      });

      // The API returns an array of jobs directly or in a specific field
      // Based on typical RSS-to-JSON RapidAPIs, it's often an array
      const jobs = Array.isArray(response.data) ? response.data : (response.data.jobs || []);

      const normalizedJobs = jobs.map((job, index) => ({
        id: `techmap-${country}-${job.id || index}`,
        title: job.title || 'Untitled Role',
        company: job.company || job.company_name || 'Unknown Company',
        location: job.location || country.toUpperCase(),
        url: job.url || job.link,
        salary: job.salary || 'Not specified',
        source: 'Techmap',
        region: 'LATAM'
      }));

      allJobs.push(...normalizedJobs);
    }

    return allJobs;
  } catch (error) {
    console.error('Error fetching jobs from Techmap:', error.response?.data || error.message);
    return []; // Return empty array on failure to allow other sources to work
  }
}
