import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://plenums.app';
  
  // Baseline static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const supabase = await createClient();
    
    // Fetch all elections to include in sitemap
    const { data: elections, error } = await supabase
      .from('elections')
      .select('election_id, updated_at, is_archived');

    if (error) {
        console.error('Supabase error generating sitemap:', error);
    }

    if (elections && elections.length > 0) {
      const dynamicRoutes = elections.map((election) => {
        // If it's archived, map it to /archive/[id], else /elections/[id]
        const path = election.is_archived 
          ? `/archive/${election.election_id}` 
          : `/elections/${election.election_id}`;
          
        return {
          url: `${baseUrl}${path}`,
          lastModified: new Date(election.updated_at || new Date()),
          changeFrequency: 'daily' as const,
          priority: election.is_archived ? 0.6 : 0.9,
        };
      });
      
      return [...routes, ...dynamicRoutes];
    }
  } catch (error) {
    console.error('Error generating sitemap dynamic routes:', error);
  }

  return routes;
}
