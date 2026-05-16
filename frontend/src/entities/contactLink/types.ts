export interface ContactLinkDto {
  id: string
  consultantId: string
  serviceName: string
  link: string
  createdAt: string
}

export interface CreateContactLinkDto {
  serviceName: string
  link: string
}

export interface UpdateContactLinkDto {
  serviceName?: string
  link?: string
}
