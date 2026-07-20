import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/shop', '/collections', '/about', '/journal'];
  return routes.map((r) => ({
    url: `${SITE.url}${r}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: r === '' ? 1 : 0.7,
  }));
}
