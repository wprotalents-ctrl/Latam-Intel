import axios from 'axios';

/**
 * Fetches job postings from Adzuna API.
 * Note: Requires ADZUNA_APP_ID and ADZUNA_APP_KEY in environment variables.
 */
export async function fetchAdzunaJobs() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn('Adzuna credentials missing. Skipping Adzuna jobs.');
    return [];
  }

  // Common countries for Adzuna
  const countries = ['us', 'gb', 'mx']; 
  const allJobs = [];

  try {
    for (const country of countries) {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;
      const response = await axios.get(url, {
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: 20,
          what: 'AI', // Default search for AI jobs as requested
          content_type: 'application/json'
        }
      });

      const jobs = response.data.results || [];
      const normalizedJobs = jobs.map((job: any) => ({
        id: `adzuna-${job.id}`,
        title: job.title,
        company: job.company?.display_name || 'Unknown',
        location: job.location?.display_name || country.toUpperCase(),
        url: job.redirect_url,
        salary: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : 'Not specified',
        source: 'Adzuna',
        region: country === 'mx' ? 'LATAM' : (country === 'us' ? 'USA' : 'Europe')
      }));

      allJobs.push(...normalizedJobs);
    }
    return allJobs;
  } catch (error) {
    console.error('Error fetching jobs from Adzuna:', error);
    return [];
  }
}
