
import React from 'react';
import { Problem, Submission, Material, User, UserRank } from './types';

export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  accent: '#0EA5E9',
  success: '#10B981',
  error: '#EF4444',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
};

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    solvedCount: 15420,
    acceptanceRate: 49.5,
    timeLimit: '1.000s',
    memoryLimit: '256 MB',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    samples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ]
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    tags: ['Linked List', 'Math'],
    solvedCount: 8940,
    acceptanceRate: 41.2,
    timeLimit: '2.000s',
    memoryLimit: '512 MB',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.',
    samples: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]' }
    ]
  },
  {
    id: '3',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search'],
    solvedCount: 4120,
    acceptanceRate: 35.8,
    timeLimit: '1.500s',
    memoryLimit: '256 MB',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    samples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' }
    ]
  }
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub1',
    problemId: '1',
    problemTitle: 'Two Sum',
    language: 'C++',
    status: 'Accepted',
    runtime: '24ms',
    memory: '10.2 MB',
    timestamp: '2 hours ago'
  }
];

export const MOCK_MATERIALS: Material[] = [
  {
    id: 'm1',
    title: 'Introduction to Arrays',
    category: 'Data Structures',
    type: 'PDF',
    relatedProblems: ['1']
  }
];

export const DEFAULT_ADMIN: User = {
  id: 'u-admin',
  username: 'admin',
  password: 'admin',
  fullName: 'Quản Trị Viên',
  email: 'admin@lqd.edu.vn',
  phone: '0000000000',
  dob: '2000-01-01',
  role: 'Admin',
  rank: UserRank.ADMIN,
  verified: true,
  stats: {
    problemsSolved: 999,
    points: 99999,
    rank: 1
  }
};
