
export interface Job {
  id: string;
  title: string;
  mission: string;
  techRequirements: string[];
  behavioralRequirements: string[];
  culture: string;
  validUntil: string;
  status: 'active' | 'closed';
  createdAt: string;
  applicantCount: number;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  appliedAt: string;
  matchScore?: number;
  matchReasoning?: string;
  missingSkills?: string[];
  interviewQuestions?: string[];
}

export enum ViewMode {
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}
