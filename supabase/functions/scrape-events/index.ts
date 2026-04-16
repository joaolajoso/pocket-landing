import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Event {
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  image_url?: string;
  event_url: string;
  category?: string;
  organization?: string;
  source?: string;
  is_featured?: boolean;
}

async function uploadImageToStorage(supabase: any, imageUrl: string, title: string): Promise<string | undefined> {
  if (!imageUrl) return undefined;

  try {
    const imageResponse = await fetch(imageUrl);
    if (imageResponse.ok) {
      const imageBlob = await imageResponse.blob();
      const fileName = `${Date.now()}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event_images')
        .upload(fileName, imageBlob, {
          contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('event_images')
          .getPublicUrl(uploadData.path);
        return publicUrl;
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
  return undefined;
}

async function scrapePortugalTechWeek(supabase: any): Promise<Event[]> {
  console.log('Starting Portugal Tech Week events scraping...');

  const response = await fetch('https://portugaltechweek.com/all-events/', {
    headers: {
      'User-Agent': 'EventBot/1.0 (Event aggregator for professional networking)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch PTW events page: ${response.status}`);
  }

  const html = await response.text();
  const events: Event[] = [];

  console.log(`PTW HTML fetched, length: ${html.length} characters`);

  const eventPattern = /<div[^>]*class="[^"]*etn-col-md-6[^"]*etn-col-lg-4[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  const matches = Array.from(html.matchAll(eventPattern));

  console.log(`PTW: Found ${matches.length} potential event matches`);

  for (const match of matches) {
    const eventHtml = match[0];
    
    const titleMatch = eventHtml.match(/<h[2-4][^>]*class="[^"]*etn-event-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>(.*?)<\/a>/i) ||
                       eventHtml.match(/<h[2-4][^>]*class="[^"]*etn-event-title[^"]*"[^>]*>(.*?)<\/h[2-4]>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    const urlMatch = eventHtml.match(/<a[^>]*href="([^"]*(?:event|register)[^"]*)"/i) ||
                     eventHtml.match(/href="([^"]*)"/i);
    let event_url = urlMatch ? urlMatch[1] : '';
    
    if (event_url && !event_url.startsWith('http')) {
      event_url = event_url.startsWith('/') ? `https://portugaltechweek.com${event_url}` : `https://portugaltechweek.com/${event_url}`;
    }

    const bgMatch = eventHtml.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
    const imgMatch = eventHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    let imageUrl = bgMatch ? bgMatch[1] : (imgMatch ? imgMatch[1] : '');
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = imageUrl.startsWith('/') ? `https://portugaltechweek.com${imageUrl}` : `https://portugaltechweek.com/${imageUrl}`;
    }

    const descMatch = eventHtml.match(/<p[^>]*class="[^"]*etn-event-excerpt[^"]*"[^>]*>(.*?)<\/p>/i) ||
                      eventHtml.match(/<div[^>]*class="[^"]*etn-event-content[^"]*"[^>]*>[\s\S]*?<p[^>]*>(.*?)<\/p>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : `Event at Portugal Tech Week`;

    const dateMatch = eventHtml.match(/<span[^>]*class="[^"]*etn-event-date[^"]*"[^>]*>[\s\S]*?([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i) ||
                      eventHtml.match(/([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i);
    let dateStr = dateMatch ? dateMatch[1].trim() : '';
    
    let event_date = new Date().toISOString();
    if (dateStr) {
      try {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          event_date = parsedDate.toISOString();
        }
      } catch (e) {
        console.error('Error parsing date:', dateStr, e);
      }
    }

    const locationMatch = eventHtml.match(/<span[^>]*class="[^"]*etn-event-location[^"]*"[^>]*>[\s\S]*?<\/i>\s*([^<]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    const categoryMatch = eventHtml.match(/<span[^>]*class="[^"]*etn-event-category[^"]*"[^>]*>(.*?)<\/span>/i);
    const category = categoryMatch ? categoryMatch[1].replace(/<[^>]*>/g, '').trim() : 'Tech Conference';

    if (title && event_url) {
      const finalImageUrl = await uploadImageToStorage(supabase, imageUrl, title);

      events.push({
        title,
        description,
        event_date,
        location,
        event_url,
        image_url: finalImageUrl,
        category,
        organization: 'Portugal Tech Week',
        source: 'portugaltechweek.com',
        is_featured: false,
      });
    }
  }

  console.log(`PTW: Found ${events.length} events`);
  return events;
}

async function scrapeDevEvents(supabase: any): Promise<Event[]> {
  console.log('Starting dev.events scraping...');
  
  const response = await fetch('https://dev.events/EU/PT/tech', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dev.events page: ${response.status}`);
  }
  
  const html = await response.text();
  console.log('dev.events HTML fetched, length:', html.length, 'characters');
  
  const events: Event[] = [];
  const seenUrls = new Set<string>();
  
  // Extract JSON-LD data - more reliable than HTML parsing
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const jsonLdMatches = Array.from(html.matchAll(jsonLdPattern));
  
  console.log(`dev.events: Found ${jsonLdMatches.length} JSON-LD blocks`);
  
  for (const match of jsonLdMatches) {
    try {
      const jsonData = JSON.parse(match[1]);
      
      // Handle array of events or single event
      const eventList = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      for (const eventData of eventList) {
        if (eventData['@type'] !== 'Event' && eventData['@type'] !== 'EducationEvent') continue;
        
        const event_url = eventData.url || '';
        if (!event_url || seenUrls.has(event_url)) continue;
        if (!event_url.includes('dev.events/conferences')) continue;
        
        seenUrls.add(event_url);
        
        const title = eventData.name || '';
        const description = eventData.description || `Tech conference`;
        const event_date = eventData.startDate || new Date().toISOString();
        const end_date = eventData.endDate || undefined;
        
        // Extract location from description or use default
        const locationMatch = description.match(/in\s+([^,]+),?\s*Portugal/i);
        const city = locationMatch ? locationMatch[1].trim() : '';
        const location = city ? `${city}, Portugal` : 'Portugal';
        
        // Get image
        let imageUrl = null;
        if (eventData.image) {
          imageUrl = Array.isArray(eventData.image) ? eventData.image[0] : eventData.image;
        }
        
        const uploadedImageUrl = imageUrl ? await uploadImageToStorage(supabase, imageUrl, title) : null;
        
        console.log(`Added from JSON-LD: "${title}" - ${event_date}`);
        
        events.push({
          title,
          description,
          event_date,
          end_date,
          location,
          event_url,
          image_url: uploadedImageUrl,
          category: 'Tech Conference',
          organization: 'dev.events',
          source: 'dev.events',
          is_featured: false,
        });
      }
    } catch (e) {
      console.log('Error parsing JSON-LD:', e);
    }
  }
  
  console.log('dev.events: Total events found:', events.length);
  return events;
}

// Helper para converter data portuguesa OU inglesa para ISO
function parseEventDate(dateStr: string): string {
  // Meses em português
  const monthsPT: Record<string, number> = {
    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3,
    'mai': 4, 'jun': 5, 'jul': 6, 'ago': 7,
    'set': 8, 'out': 9, 'nov': 10, 'dez': 11
  };
  
  // Meses em inglês
  const monthsEN: Record<string, number> = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
    'may': 4, 'jun': 5, 'jul': 6, 'aug': 7,
    'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  // Formato português: "14 de jan., 9:30" ou "14 de janeiro, 9:30"
  const ptMatch = dateStr.match(/(\d{1,2})\s*de\s*([a-zç]+)\.?,?\s*(\d{1,2}):(\d{2})/i);
  if (ptMatch) {
    const day = parseInt(ptMatch[1]);
    const monthStr = ptMatch[2].toLowerCase().substring(0, 3);
    const month = monthsPT[monthStr] ?? 0;
    const hour = parseInt(ptMatch[3]);
    const minute = parseInt(ptMatch[4]);
    return buildEventDate(day, month, hour, minute);
  }

  // Formato inglês: "Jan 14, 2:30 PM" ou "Jan 14, 14:30"
  const enMatch = dateStr.match(/([A-Za-z]+)\s*(\d{1,2}),?\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (enMatch) {
    const monthStr = enMatch[1].toLowerCase().substring(0, 3);
    const day = parseInt(enMatch[2]);
    let hour = parseInt(enMatch[3]);
    const minute = parseInt(enMatch[4]);
    const ampm = enMatch[5]?.toUpperCase();
    
    // Converter 12h para 24h
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const month = monthsEN[monthStr] ?? 0;
    return buildEventDate(day, month, hour, minute);
  }

  console.log(`Could not parse date: "${dateStr}"`);
  return new Date().toISOString();
}

function buildEventDate(day: number, month: number, hour: number, minute: number): string {
  const now = new Date();
  let year = now.getFullYear();
  const testDate = new Date(year, month, day);
  if (testDate < now) {
    year++;
  }
  return new Date(year, month, day, hour, minute).toISOString();
}

async function scrapeDevsComPt(supabase: any): Promise<Event[]> {
  console.log('Starting devs.com.pt scraping...');
  
  const events: Event[] = [];
  const baseUrl = 'https://devs.com.pt/pt/events/upcoming/all';
  const seenUrls = new Set<string>();
  
  // Buscar as 3 páginas de eventos
  for (let page = 1; page <= 3; page++) {
    try {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      console.log(`Fetching devs.com.pt page ${page}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
        },
      });
      
      if (!response.ok) {
        console.log(`Page ${page} not found or error: ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`devs.com.pt page ${page} fetched, length: ${html.length} characters`);
      
      // Extrair blocos de eventos - cada evento está numa <li class="events__item...">
      const eventPattern = /<li[^>]*class="[^"]*events__item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
      const matches = Array.from(html.matchAll(eventPattern));
      
      console.log(`devs.com.pt page ${page}: Found ${matches.length} event items`);
      
      for (const match of matches) {
        const eventHtml = match[1];
        
        // Extrair imagem
        const imgMatch = eventHtml.match(/src="([^"]+)"/i);
        let imageUrl = imgMatch ? imgMatch[1] : null;
        
        // Extrair categoria
        const catMatch = eventHtml.match(/<p[^>]*class="[^"]*category[^"]*"[^>]*>([^<]+)/i);
        const category = catMatch ? catMatch[1].trim() : 'Tech';
        
        // Extrair título e URL
        const titleMatch = eventHtml.match(/<h3[^>]*class="[^"]*event__title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)/i);
        const event_url = titleMatch ? titleMatch[1].trim() : '';
        const title = titleMatch ? titleMatch[2].trim() : '';
        
        // Evitar duplicados
        if (!event_url || seenUrls.has(event_url)) continue;
        seenUrls.add(event_url);
        
        // Extrair cidade
        const cityMatch = eventHtml.match(/<span[^>]*class="[^"]*city[^"]*"[^>]*>([^<]+)/i);
        const city = cityMatch ? cityMatch[1].trim() : '';
        
        // Extrair data (formato: "14 de jan., 9:30")
        const dateMatch = eventHtml.match(/<span[^>]*class="[^"]*date[^"]*"[^>]*>[\s\S]*?<strong>([^<]+)/i);
        const dateStr = dateMatch ? dateMatch[1].trim() : '';
        
        // Converter data para ISO
        const event_date = parseEventDate(dateStr);
        
        if (title && event_url) {
          // Upload da imagem para storage
          const finalImageUrl = imageUrl ? await uploadImageToStorage(supabase, imageUrl, title) : undefined;
          
          const location = city ? `${city}, Portugal` : 'Portugal';
          
          events.push({
            title,
            description: category ? `${category} em ${city || 'Portugal'}` : `Evento tech em ${city || 'Portugal'}`,
            event_date,
            location,
            event_url,
            image_url: finalImageUrl,
            category: category || 'Tech',
            organization: 'devs.com.pt',
            source: 'devs.com.pt',
            is_featured: false,
          });
          
          console.log(`Added from devs.com.pt: "${title}" - ${city} - ${dateStr}`);
        }
      }
    } catch (err) {
      console.error(`Error scraping devs.com.pt page ${page}:`, err);
    }
  }
  
  console.log(`devs.com.pt: Total events found: ${events.length}`);
  return events;
}

async function scrapeNFeiras(supabase: any): Promise<Event[]> {
  console.log('Starting nfeiras.com scraping...');
  
  const events: Event[] = [];
  const url = 'https://www.nfeiras.com/tecnologia/portugal/';
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-PT,pt;q=0.9',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch nfeiras.com: ${response.status}`);
  }
  
  const html = await response.text();
  console.log(`nfeiras.com HTML fetched, length: ${html.length} characters`);
  
  // Cada evento está num <article class="card card-tradeShow" data-href="...">
  const eventPattern = /<article[^>]*class="[^"]*card-tradeShow[^"]*"[^>]*data-href="([^"]+)"[^>]*>([\s\S]*?)<\/article>/gi;
  const matches = Array.from(html.matchAll(eventPattern));
  
  console.log(`nfeiras.com: Found ${matches.length} event cards`);
  
  const seenUrls = new Set<string>();
  const now = new Date();
  
  for (const match of matches) {
    const event_url = match[1];
    const eventHtml = match[2];
    
    // Evitar duplicados
    if (seenUrls.has(event_url)) continue;
    seenUrls.add(event_url);
    
    // Extrair título
    const titleMatch = eventHtml.match(/<a[^>]*class="[^"]*text-dark[^"]*medium[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                       eventHtml.match(/<a[^>]*class="[^"]*medium[^"]*text-dark[^"]*"[^>]*>([^<]+)<\/a>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extrair imagem (corrigir URLs protocol-relative que começam com //)
    const imgMatch = eventHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
    let imageUrl = imgMatch ? imgMatch[1] : null;
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }
    
    // Extrair data início (usar atributo datetime - muito fiável!)
    const startDateMatch = eventHtml.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i);
    const event_date = startDateMatch ? startDateMatch[1] : new Date().toISOString();
    
    // Extrair data fim (para eventos com range)
    const endDateMatch = eventHtml.match(/<time[^>]*class="[^"]*dtend[^"]*"[^>]*datetime="([^"]+)"[^>]*>/i);
    const end_date = endDateMatch ? endDateMatch[1] : undefined;
    
    // Filtrar eventos passados
    const eventDateObj = new Date(event_date);
    if (eventDateObj < now) {
      console.log(`Skipping past event: "${title}" - ${event_date}`);
      continue;
    }
    
    // Extrair local (cidade antes de "Portugal")
    const locationMatch = eventHtml.match(/<br[^>]*>\s*([^<]+,\s*Portugal)/i);
    const location = locationMatch ? locationMatch[1].trim() : 'Portugal';
    
    // Extrair categorias
    const categoryDiv = eventHtml.match(/<div[^>]*class="[^"]*text-muted[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    let category = 'Tecnologia';
    if (categoryDiv) {
      const spans = categoryDiv[1].match(/<span>([^<]+)<\/span>/gi);
      if (spans) {
        category = spans.map(s => s.replace(/<\/?span>/gi, '').trim()).join(', ');
      }
    }
    
    if (title && event_url) {
      const finalImageUrl = imageUrl ? await uploadImageToStorage(supabase, imageUrl, title) : undefined;
      
      events.push({
        title,
        description: `Feira de ${category} em ${location}`,
        event_date,
        end_date,
        location,
        event_url,
        image_url: finalImageUrl,
        category,
        organization: 'nfeiras.com',
        source: 'nfeiras.com',
        is_featured: false,
      });
      
      console.log(`Added from nfeiras.com: "${title}" - ${location} - ${event_date}`);
    }
  }
  
  console.log(`nfeiras.com: Total future events found: ${events.length}`);
  return events;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Scrape from all four sources
    const [ptwEvents, devEvents, devsComPtEvents, nfeirasEvents] = await Promise.all([
      scrapePortugalTechWeek(supabase).catch(err => {
        console.error('Error scraping Portugal Tech Week:', err);
        return [];
      }),
      scrapeDevEvents(supabase).catch(err => {
        console.error('Error scraping dev.events:', err);
        return [];
      }),
      scrapeDevsComPt(supabase).catch(err => {
        console.error('Error scraping devs.com.pt:', err);
        return [];
      }),
      scrapeNFeiras(supabase).catch(err => {
        console.error('Error scraping nfeiras.com:', err);
        return [];
      }),
    ]);

    const allEvents = [...ptwEvents, ...devEvents, ...devsComPtEvents, ...nfeirasEvents];
    console.log(`Total events from all sources: ${allEvents.length}`);

    // Insert events into database (avoiding duplicates)
    if (allEvents.length > 0) {
      for (const event of allEvents) {
        const { error } = await supabase
          .from('events')
          .upsert(event, {
            onConflict: 'event_url',
            ignoreDuplicates: true,
          });

        if (error) {
          console.error('Error inserting event:', error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped ${allEvents.length} events from all sources`,
        events_count: allEvents.length,
        sources: {
          portugaltechweek: ptwEvents.length,
          devevents: devEvents.length,
          devscompt: devsComPtEvents.length,
          nfeiras: nfeirasEvents.length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error scraping events:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});