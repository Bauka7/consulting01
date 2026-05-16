export interface AchievementDto {
  id: string
  userId: string
  description: string
  createdAt: string
}

export interface CreateAchievementDto {
  userId: string
  description: string
}
