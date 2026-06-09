import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/officer/'],
    },
    sitemap: 'https://plenums.app/sitemap.xml',
  };
}
