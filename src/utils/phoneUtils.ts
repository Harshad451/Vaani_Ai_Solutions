/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CountryPhoneInfo {
  code: string;       // Dialing code (e.g., "+91")
  name: string;       // Country name (e.g., "India")
  iso: string;        // ISO 3166-1 alpha-2 (e.g., "IN")
  flag: string;       // Flag emoji (e.g., "🇮🇳")
}

export const countryPrefixes: CountryPhoneInfo[] = [
  { code: "+1", name: "United States / Canada", iso: "US/CA", flag: "🇺🇸" },
  { code: "+7", name: "Russia / Kazakhstan", iso: "RU/KZ", flag: "🇷🇺" },
  { code: "+20", name: "Egypt", iso: "EG", flag: "🇪🇬" },
  { code: "+27", name: "South Africa", iso: "ZA", flag: "🇿🇦" },
  { code: "+30", name: "Greece", iso: "GR", flag: "🇬🇷" },
  { code: "+31", name: "Netherlands", iso: "NL", flag: "🇳🇱" },
  { code: "+32", name: "Belgium", iso: "BE", flag: "🇧🇪" },
  { code: "+33", name: "France", iso: "FR", flag: "🇫🇷" },
  { code: "+34", name: "Spain", iso: "ES", flag: "🇪🇸" },
  { code: "+36", name: "Hungary", iso: "HU", flag: "🇭🇺" },
  { code: "+39", name: "Italy", iso: "IT", flag: "🇮🇹" },
  { code: "+40", name: "Romania", iso: "RO", flag: "🇷🇴" },
  { code: "+41", name: "Switzerland", iso: "CH", flag: "🇨🇭" },
  { code: "+43", name: "Austria", iso: "AT", flag: "🇦🇹" },
  { code: "+44", name: "United Kingdom", iso: "GB", flag: "🇬🇧" },
  { code: "+45", name: "Denmark", iso: "DK", flag: "🇩🇰" },
  { code: "+46", name: "Sweden", iso: "SE", flag: "🇸🇪" },
  { code: "+47", name: "Norway", iso: "NO", flag: "🇳🇴" },
  { code: "+48", name: "Poland", iso: "PL", flag: "🇵🇱" },
  { code: "+49", name: "Germany", iso: "DE", flag: "🇩🇪" },
  { code: "+51", name: "Peru", iso: "PE", flag: "🇵🇪" },
  { code: "+52", name: "Mexico", iso: "MX", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", iso: "AR", flag: "🇦🇷" },
  { code: "+55", name: "Brazil", iso: "BR", flag: "🇧🇷" },
  { code: "+56", name: "Chile", iso: "CL", flag: "🇨🇱" },
  { code: "+57", name: "Colombia", iso: "CO", flag: "🇨🇴" },
  { code: "+58", name: "Venezuela", iso: "VE", flag: "🇻🇪" },
  { code: "+60", name: "Malaysia", iso: "MY", flag: "🇲🇾" },
  { code: "+61", name: "Australia", iso: "AU", flag: "🇦🇺" },
  { code: "+62", name: "Indonesia", iso: "ID", flag: "🇮🇩" },
  { code: "+63", name: "Philippines", iso: "PH", flag: "🇵🇭" },
  { code: "+64", name: "New Zealand", iso: "NZ", flag: "🇳🇿" },
  { code: "+65", name: "Singapore", iso: "SG", flag: "🇸🇬" },
  { code: "+66", name: "Thailand", iso: "TH", flag: "🇹🇭" },
  { code: "+81", name: "Japan", iso: "JP", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", iso: "KR", flag: "🇰🇷" },
  { code: "+84", name: "Vietnam", iso: "VN", flag: "🇻🇳" },
  { code: "+86", name: "China", iso: "CN", flag: "🇨🇳" },
  { code: "+90", name: "Turkey", iso: "TR", flag: "🇹🇷" },
  { code: "+91", name: "India", iso: "IN", flag: "🇮🇳" },
  { code: "+92", name: "Pakistan", iso: "PK", flag: "🇵🇰" },
  { code: "+93", name: "Afghanistan", iso: "AF", flag: "🇦🇫" },
  { code: "+94", name: "Sri Lanka", iso: "LK", flag: "🇱🇰" },
  { code: "+95", name: "Myanmar", iso: "MM", flag: "🇲🇲" },
  { code: "+98", name: "Iran", iso: "IR", flag: "🇮🇷" },
  { code: "+212", name: "Morocco", iso: "MA", flag: "🇲🇦" },
  { code: "+880", name: "Bangladesh", iso: "BD", flag: "🇧🇩" },
  { code: "+971", name: "United Arab Emirates", iso: "AE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", iso: "SA", flag: "🇸🇦" },
  { code: "+972", name: "Israel", iso: "IL", flag: "🇮🇱" }
];

export function getCountryFromPhone(phone: string | undefined | null): CountryPhoneInfo | null {
  if (!phone) return null;
  
  // Clean phone number: remove spaces, dashes, parentheses and prefix 00 with + (if applicable)
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }
  
  // Sort prefixes by length descending to match longest code first (e.g. +971 before +9)
  const sortedPrefixes = [...countryPrefixes].sort((a, b) => b.code.length - a.code.length);
  
  for (const info of sortedPrefixes) {
    // Check with plus sign
    if (cleaned.startsWith(info.code)) {
      return info;
    }
    
    // Check without plus sign
    const codeNoPlus = info.code.replace('+', '');
    if (cleaned.startsWith(codeNoPlus)) {
      return info;
    }
  }
  
  return null;
}
