export const siteConfig = {
  repoOwner: 'Wiktor87',
  repoName: 'oliverkonst',
  contactEmail: 'oliver_skifs@hotmail.com',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

/** Prefix a public asset path with the configured base path */
export function publicUrl(path: string): string {
  return `${siteConfig.basePath}${path}`;
}
