
/**
 * Creates a vCard string with contact information, photo, and public links
 */
export function generateVCard(params: {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  publicLinks?: Array<{title: string; url: string}>;
  profileUrl?: string;
  jobTitle?: string;
  headline?: string;
}): string {
  const { name, email, phone, website, bio, photoUrl, publicLinks, profileUrl, jobTitle, headline } = params;
  
  const escape = (text: string = '') => 
    text.replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');

  // Create name parts (for better compatibility)
  const nameParts = name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ');

  let vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//PocketCV//Digital Business Card//EN',
    `FN:${escape(name)}`,
    `N:${escape(lastName || '')};${escape(firstName)};;;`,
  ];
  
  // Add job title if available
  if (jobTitle || headline) {
    vcard.push(`TITLE:${escape(jobTitle || headline || '')}`);
  }
  
  // Add contact information
  if (email) vcard.push(`EMAIL;TYPE=INTERNET:${escape(email)}`);
  if (phone) vcard.push(`TEL;TYPE=CELL:${escape(phone)}`);
  
  // Add profile photo if available
  if (photoUrl) {
    vcard.push(`PHOTO;VALUE=URL:${escape(photoUrl)}`);
  }
  
  // Add website as primary URL
  if (website) {
    vcard.push(`URL:${escape(website)}`);
  }
  
  // Add profile URL
  if (profileUrl) {
    vcard.push(`URL:${escape(profileUrl)}`);
  }
  
  // Add public links as additional URLs
  if (publicLinks && publicLinks.length > 0) {
    publicLinks.forEach(link => {
      if (link.url && link.url !== website && link.url !== profileUrl) {
        vcard.push(`URL:${escape(link.url)}`);
      }
    });
  }
  
  // Add bio/note
  if (bio) vcard.push(`NOTE:${escape(bio)}`);
  
  vcard.push('END:VCARD');
  
  return vcard.join('\r\n');
}

/**
 * Creates a downloadable vCard link for contact information with enhanced data
 */
export function createVCardDownloadLink(contact: {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  publicLinks?: Array<{title: string; url: string}>;
  profileUrl?: string;
  jobTitle?: string;
  headline?: string;
}): string {
  const vCardData = generateVCard(contact);
  const blob = new Blob([vCardData], { type: 'text/vcard' });
  return URL.createObjectURL(blob);
}

/**
 * Downloads a vCard with iOS-compatible approach.
 * On iOS Safari, uses data URI to trigger native "Add to Contacts" dialog.
 * On other platforms, uses standard blob download.
 */
export function downloadVCard(params: {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  publicLinks?: Array<{title: string; url: string}>;
  profileUrl?: string;
  jobTitle?: string;
  headline?: string;
}): void {
  const vCardData = generateVCard(params);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    // Data URI approach triggers native iOS "Add to Contacts" sheet
    const base64 = btoa(unescape(encodeURIComponent(vCardData)));
    const dataUri = `data:text/vcard;base64,${base64}`;
    window.open(dataUri, '_self');
  } else {
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(params.name || 'contact').replace(/\s+/g, '-')}.vcf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
