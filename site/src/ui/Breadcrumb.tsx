'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Breadcrumb.module.css';
import { formatSiteName } from '@utils/formatSiteName';

interface BreadcrumbItem {
  label: string;
  href: string;
  isLoading?: boolean;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});
  
  // Fetch dynamic data for pilots and sites
  useEffect(() => {
    const fetchDynamicData = async () => {
      const segments = pathname.split('/').filter(Boolean);
      const newLabels: Record<string, string> = {};

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const prevSegment = segments[i - 1];

        // Fetch pilot name
        if (prevSegment === 'pilots' && !isNaN(Number(segment))) {
          try {
            const response = await fetch(`/api/pilots/${segment}`);
            if (response.ok) {
              const pilot = await response.json();
              newLabels[`pilot-${segment}`] = pilot.first_name;
            }
          } catch (error) {
            console.warn('Failed to fetch pilot name:', error);
          }
        }

        // Fetch site name
        if (prevSegment === 'sites') {
          try {
            const response = await fetch(`/api/sites/${segment}`);
            if (response.ok) {
              const site = await response.json();
              newLabels[`site-${segment}`] = formatSiteName(site.name);
            }
          } catch (error) {
            console.warn('Failed to fetch site name:', error);
          }
        }
      }

      setDynamicLabels(newLabels);
    };

    fetchDynamicData().catch(console.error);
  }, [pathname]);

  // Skip breadcrumb on home page
  if (pathname === '/') {
    return null;
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      // Handle different route patterns
      if (segment === 'pilots') {
        breadcrumbs.push({ label: 'Pilots', href: '/pilots' });
      } else if (segment === 'flights') {
        breadcrumbs.push({ label: 'Flights', href: '/flights' });
      } else if (segment === 'sites') {
        breadcrumbs.push({ label: 'Sites', href: '/sites' });
      } else if (segment === 'dashboard') {
        breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });
      } else if (segment === 'login') {
        breadcrumbs.push({ label: 'Login', href: '/login' });
      } else if (segment === 'welcome') {
        breadcrumbs.push({ label: 'Welcome', href: '/welcome' });
      } else if (segments[i - 1] === 'pilots' && !isNaN(Number(segment))) {
        // Pilot ID - use dynamic name if available
        const pilotName = dynamicLabels[`pilot-${segment}`];
        breadcrumbs.push({ 
          label: pilotName || 'Pilot', 
          href: currentPath,
          isLoading: !pilotName
        });
      } else if (segments[i - 1] === 'flights' && !isNaN(Number(segment))) {
        // Flight ID
        breadcrumbs.push({ label: 'Flight', href: currentPath });
      } else if (segments[i - 1] === 'sites') {
        // Site slug - use dynamic name if available
        const siteName = dynamicLabels[`site-${segment}`];
        breadcrumbs.push({ 
          label: siteName || 'Site', 
          href: currentPath,
          isLoading: !siteName
        });
      } else if (segments[i - 2] === 'pilots' && segments[i - 1] && !isNaN(Number(segments[i - 1]))) {
        // Wing name under pilot
        breadcrumbs.push({ label: decodeURIComponent(segment), href: currentPath });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={styles.container} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className={styles.item}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link 
                  href={item.href} 
                  className={`${styles.link} ${item.isLoading ? styles.loading : ''}`}
                >
                  {item.label}
                </Link>
                <span className={styles.separator}>›</span>
              </>
            ) : (
              <span 
                className={`${styles.current} ${item.isLoading ? styles.loading : ''}`} 
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}