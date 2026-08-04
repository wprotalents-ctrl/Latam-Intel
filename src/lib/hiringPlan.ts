export interface HiringPlanInput {
  role: string;
  seniority: 'junior' | 'mid' | 'senior';
  country?: string;
  salary?: number;
}

export interface HiringPlanApiData {
  bestCountry?: string;
  averageSalary?: number;
}

export interface HiringPlan {
  bestCountry: string;
  salary: number;
  timeToHire: number;
  summary: string;
}

const TIME_TO_HIRE: Record<'junior' | 'mid' | 'senior', number> = {
  junior: 14,
  mid: 21,
  senior: 30,
};

export function generateHiringPlan(
  input: HiringPlanInput,
  apiData: HiringPlanApiData = {}
): HiringPlan {
  const bestCountry = apiData.bestCountry ?? input.country ?? 'Colombia';
  const salary = input.salary ?? apiData.averageSalary ?? 0;
  const timeToHire = TIME_TO_HIRE[input.seniority];

  const summary =
    `A ${input.seniority}-level ${input.role} based in ${bestCountry}. ` +
    `Expected time to first qualified profiles: ${timeToHire} days. ` +
    (salary > 0
      ? `Target compensation: $${salary.toLocaleString()} USD/yr.`
      : 'Compensation to be defined based on profile.');

  return { bestCountry, salary, timeToHire, summary };
}
