import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentLink {
  title: string;
  url: string;
}

export interface LandingConfig {
  logo_url: string | null;
  event_name: string | null;
  description: string | null;
  payment_amount: string | null;
  payment_deadline: string | null;
  payment_url: string | null;
  payment_links: PaymentLink[];
  show_payment: boolean;
}

export interface EventPublicData {
  event: {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    end_date: string | null;
    location: string | null;
    image_url: string | null;
    access_type: string;
    category: string | null;
    event_type: string | null;
    organization_id: string | null;
    organization: string | null;
    created_by: string | null;
    internal_event: boolean | null;
  } | null;
  organization: {
    id: string;
    name: string;
    logo_url: string | null;
    banner_url: string | null;
  } | null;
  paymentInfo: {
    method: string;
    key: string;
  } | null;
  landingConfig: LandingConfig | null;
  loading: boolean;
  error: string | null;
  isRestricted: boolean;
}

export const useEventPublicData = (eventId: string) => {
  const [data, setData] = useState<EventPublicData>({
    event: null,
    organization: null,
    paymentInfo: null,
    landingConfig: null,
    loading: true,
    error: null,
    isRestricted: false,
  });

  useEffect(() => {
    if (!eventId) {
      setData(prev => ({ ...prev, loading: false, error: 'No event ID' }));
      return;
    }

    const fetchData = async () => {
      try {
        // Try direct query first
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, title, description, event_date, end_date, location, image_url, access_type, category, event_type, organization_id, organization, created_by, internal_event')
          .eq('id', eventId)
          .maybeSingle();

        if (eventError) {
          console.error('Error fetching event:', eventError);
        }

        // If RLS blocked, use edge function as fallback
        if (!eventData) {
          try {
            const response = await fetch(
              `https://xhcqhmbhivxbwnoifcoc.supabase.co/functions/v1/get-event-public?eventId=${eventId}`,
              {
                headers: {
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo',
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.ok) {
              const result = await response.json();
              setData({
                event: result.event,
                organization: result.organization,
                paymentInfo: result.paymentInfo,
                landingConfig: result.landingConfig || null,
                loading: false,
                error: null,
                isRestricted: true,
              });
              return;
            }
          } catch (fnErr) {
            console.error('Edge function fallback failed:', fnErr);
          }

          setData({
            event: null,
            organization: null,
            paymentInfo: null,
            landingConfig: null,
            loading: false,
            error: null,
            isRestricted: true,
          });
          return;
        }

        // Fetch org + payment + landing config in parallel
        let organization = null;
        let paymentInfo = null;
        let landingConfig = null;

        const lcPromise = supabase
          .from('event_landing_config')
          .select('logo_url, event_name, description, payment_amount, payment_deadline, payment_url, payment_links, show_payment')
          .eq('event_id', eventId)
          .maybeSingle()
          .then(({ data: lcData }) => {
            if (lcData) {
              landingConfig = {
                ...lcData,
                payment_links: (lcData.payment_links as unknown as PaymentLink[]) || [],
              };
            }
          });

        const orgPromises: Promise<any>[] = [];
        if (eventData.organization_id) {
          orgPromises.push(
            Promise.resolve(supabase
              .from('organizations')
              .select('id, name, logo_url, banner_url')
              .eq('id', eventData.organization_id)
              .maybeSingle()
              .then(({ data: orgData }) => { organization = orgData; }))
          );
          orgPromises.push(
            Promise.resolve(supabase
              .from('organization_websites')
              .select('payment_method, payment_key, show_payment_method')
              .eq('organization_id', eventData.organization_id)
              .maybeSingle()
              .then(({ data: websiteData }) => {
                if (websiteData?.show_payment_method && websiteData?.payment_key) {
                  paymentInfo = {
                    method: websiteData.payment_method || 'mbway',
                    key: websiteData.payment_key,
                  };
                }
              }))
          );
        }

        await Promise.all([lcPromise, ...orgPromises]);

        setData({
          event: eventData,
          organization,
          paymentInfo,
          landingConfig,
          loading: false,
          error: null,
          isRestricted: false,
        });
      } catch (err: any) {
        console.error('Error fetching event public data:', err);
        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Error loading event',
        }));
      }
    };

    fetchData();
  }, [eventId]);

  return data;
};
