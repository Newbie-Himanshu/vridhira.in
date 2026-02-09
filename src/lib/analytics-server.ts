'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export interface AnalyticsSettings {
    analytics_enabled: boolean;
    ga4_measurement_id: string | null;
    gtm_container_id: string | null;
}

const DEFAULT_SETTINGS: AnalyticsSettings = {
    analytics_enabled: false,
    ga4_measurement_id: null,
    gtm_container_id: null,
};

/**
 * Get analytics settings from platform_settings
 * Used in root layout to conditionally render GA4/GTM scripts
 */
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
    // Opt out of static generation for this function
    noStore();

    try {
        const supabase = await createClient();

        const { data: settings, error } = await supabase
            .from('platform_settings')
            .select('analytics_enabled, ga4_measurement_id, gtm_container_id')
            .limit(1)
            .single();

        if (error) {
            // Silently return defaults on error (e.g., during static generation)
            return DEFAULT_SETTINGS;
        }

        return {
            analytics_enabled: settings?.analytics_enabled ?? false,
            ga4_measurement_id: settings?.ga4_measurement_id ?? null,
            gtm_container_id: settings?.gtm_container_id ?? null,
        };
    } catch {
        // Return defaults during build time / static generation
        return DEFAULT_SETTINGS;
    }
}
