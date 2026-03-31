import axios from 'axios';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  publication_date: string;
}

export async function fetchRemotiveJobs() {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs');
    const jobs: RemotiveJob[] = response.data.jobs;

    // Filter for LATAM, USA, Europe, or Worldwide
    const filteredJobs = jobs.filter(job => {
      const location = job.candidate_required_location.toLowerCase();
      return (
        location.includes('worldwide') ||
        location.includes('latam') ||
        location.includes('latin america') ||
        location.includes('usa') ||
        location.includes('united states') ||
        location.includes('europe') ||
        location.includes('uk') ||
        location.includes('brazil') ||
        location.includes('mexico') ||
        location.includes('colombia') ||
        location.includes('argentina') ||
        location.includes('chile')
      );
    });

    return filteredJobs.map(job => {
      const location = job.candidate_required_location.toLowerCase();
      let region = 'Worldwide';
      if (location.includes('usa') || location.includes('united states')) region = 'USA';
      else if (location.includes('europe') || location.includes('uk')) region = 'Europe';
      else if (location.includes('latam') || location.includes('latin america') || location.includes('brazil') || location.includes('mexico') || location.includes('colombia') || location.includes('argentina') || location.includes('chile')) region = 'LATAM';

      return {
        id: job.id.toString(),
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location,
        url: job.url,
        salary: job.salary || 'Not specified',
        source: 'Remotive',
        region: region
      };
    });
  } catch (error) {
    console.error('Error fetching jobs from Remotive:', error);
    throw error;
  }
}
