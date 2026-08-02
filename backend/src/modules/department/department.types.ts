export interface DepartmentAchievement {
  year: number;
  title: string;
  description: string;
  category: DepartmentAchievementCategory;
}

export type DepartmentAchievementCategory = 'RESEARCH' | 'AWARD' | 'RANKING' | 'INFRASTRUCTURE' | 'OTHER';

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
