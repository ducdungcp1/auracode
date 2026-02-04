
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export enum UserRank {
  USER = 1,
  STUDENT = 2,
  TEACHER = 3,
  ADMIN = 4
}

export type UserRole = 'User' | 'Student' | 'Teacher' | 'Admin';

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solvedCount: number;
  acceptanceRate: number;
  timeLimit: string;
  memoryLimit: string;
  description: string;
  samples: { input: string; output: string }[];
}

export interface User {
  id: string;
  username: string;
  password?: string; // Chỉ dùng cho mock backend
  fullName: string;
  email: string;
  phone: string;
  studentId?: string; // Không bắt buộc
  dob: string;
  role: UserRole;
  rank: UserRank;
  verified: boolean;
  stats: {
    problemsSolved: number;
    points: number;
    rank: number;
  };
}

export interface RegistrationData {
  username: string;
  surname: string;
  givenName: string;
  email: string;
  phone: string;
  id?: string;
  dob: string;
  password: string;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'TLE' | 'Runtime Error' | 'Judging';
  runtime: string;
  memory: string;
  timestamp: string;
}

export interface Material {
  id: string;
  title: string;
  category: string;
  type: 'PDF' | 'Video' | 'Article';
  relatedProblems: string[];
}
