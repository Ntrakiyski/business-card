import { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function generateVCard(profile: Profile): string {
  const {
    display_name,
    job_title,
    company,
    email,
    phone,
    website,
    address,
  } = profile;

  // Format: vCard 3.0
  let vcard = 'BEGIN:VCARD\n';
  vcard += 'VERSION:3.0\n';
  
  // Full name - split into first and last name
  if (display_name) {
    const nameParts = display_name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    vcard += `FN:${display_name}\n`;
    // N format: Last;First;Middle;Prefix;Suffix
    vcard += `N:${lastName};${firstName};;;\n`;
  }
  
  // Organization and title
  if (company) {
    vcard += `ORG:${company}\n`;
  }
  if (job_title) {
    vcard += `TITLE:${job_title}\n`;
  }
  
  // Contact info
  if (email) {
    vcard += `EMAIL;TYPE=INTERNET:${email}\n`;
  }
  if (phone) {
    vcard += `TEL;TYPE=CELL:${phone}\n`;
  }
  if (website) {
    vcard += `URL:${website}\n`;
  }
  
  // Address
  if (address) {
    vcard += `ADR;TYPE=WORK:;;${address};;;;\n`;
  }
  
  vcard += 'END:VCARD';
  
  return vcard;
}

export function downloadVCard(profile: Profile): void {
  const vcard = generateVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.username || 'contact'}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
