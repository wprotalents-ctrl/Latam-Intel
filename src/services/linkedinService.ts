import axios from 'axios';

interface LinkedInJob {
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_url: string;
  salary?: string;
}

export async function fetchLinkedInJobs() {
  const API_KEY = process.env.RAPIDAPI_LINKEDIN_KEY;
  if (!API_KEY) {
    console.warn('RAPIDAPI_LINKEDIN_KEY is missing, skipping LinkedIn jobs.');
    return [];
  }

  try {
    const response = await axios.get('https://linkedin-job-search-api.p.rapidapi.com/active-jb-1h', {
      params: {
        limit: 100,
        offset: 0,
        description_type: 'text'
      },
      headers: {
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com',
        'x-rapidapi-key': API_KEY
      }
    });

    // Assuming response.data is an array or has a results field
    const jobsData = Array.isArray(response.data) ? response.data : (response.data.results || []);

    return jobsData.map((job: any) => {
      const location = (job.location || 'Remote').toLowerCase();
      let region = 'Worldwide';
      if (location.includes('usa') || location.includes('united states')) region = 'USA';
      else if (location.includes('europe') || location.includes('uk')) region = 'Europe';
      else if (location.includes('latam') || location.includes('latin america') || location.includes('brazil') || location.includes('mexico') || location.includes('colombia') || location.includes('argentina') || location.includes('chile')) region = 'LATAM';

      return {
        id: job.job_id || Math.random().toString(36).substr(2, 9),
        title: job.job_title || 'AI Specialist',
        company: job.company_name || 'Tech Corp',
        location: job.location || 'Remote',
        url: job.job_url || '#',
        salary: job.salary || 'Not specified',
        source: 'LinkedIn (RapidAPI)',
        region: region
      };
    });
  } catch (error) {
    console.error('Error fetching jobs from LinkedIn API:', error);
    return [];
  }
}
