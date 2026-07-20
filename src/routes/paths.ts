export const paths = {
  home: '/',
  someday: '/someday',
  trends: '/trends',
  mood: '/mood',
  moodNew: '/mood/new',
  moodDetail: (id: number) => `/mood/${id}`,
  moodEdit: (id: number) => `/mood/${id}/edit`,
} as const;
