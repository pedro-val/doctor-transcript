// Can be imported from a shared config
export const locales = ['pt', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'pt' 