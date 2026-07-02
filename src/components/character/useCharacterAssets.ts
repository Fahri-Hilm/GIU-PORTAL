import type { Profile } from '@/lib/types';

function slugifyCodename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getCharacterAssetPath(profile: Profile): string {
  if (profile.portrait_url) return profile.portrait_url;
  if (profile.codename) return `/characters/${slugifyCodename(profile.codename)}.webp`;
  return '/characters/default.webp';
}

export function getCharacterBgPath(_codename: string | null): string {
  return '/characters/bg-default.webp';
}

export function getCharacterFallbackPath(): string {
  return '/characters/default.webp';
}

export { slugifyCodename };
