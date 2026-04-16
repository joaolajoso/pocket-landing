export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  phoneLength: number | number[]; // Expected phone number length (without country code)
  format?: string; // Example format
}

export const countryCodes: CountryCode[] = [
  { code: "+351", country: "Portugal", flag: "🇵🇹", phoneLength: 9, format: "912 345 678" },
  { code: "+55", country: "Brasil", flag: "🇧🇷", phoneLength: [10, 11], format: "11 91234 5678" },
  { code: "+34", country: "Espanha", flag: "🇪🇸", phoneLength: 9, format: "612 345 678" },
  { code: "+33", country: "França", flag: "🇫🇷", phoneLength: 9, format: "6 12 34 56 78" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧", phoneLength: 10, format: "7911 123456" },
  { code: "+49", country: "Alemanha", flag: "🇩🇪", phoneLength: [10, 11], format: "151 1234 5678" },
  { code: "+39", country: "Itália", flag: "🇮🇹", phoneLength: 10, format: "312 345 6789" },
  { code: "+31", country: "Países Baixos", flag: "🇳🇱", phoneLength: 9, format: "6 12345678" },
  { code: "+32", country: "Bélgica", flag: "🇧🇪", phoneLength: 9, format: "470 12 34 56" },
  { code: "+41", country: "Suíça", flag: "🇨🇭", phoneLength: 9, format: "78 123 45 67" },
  { code: "+43", country: "Áustria", flag: "🇦🇹", phoneLength: [10, 11], format: "664 1234567" },
  { code: "+1", country: "EUA/Canadá", flag: "🇺🇸", phoneLength: 10, format: "201 555 0123" },
  { code: "+52", country: "México", flag: "🇲🇽", phoneLength: 10, format: "55 1234 5678" },
  { code: "+54", country: "Argentina", flag: "🇦🇷", phoneLength: 10, format: "11 1234 5678" },
  { code: "+56", country: "Chile", flag: "🇨🇱", phoneLength: 9, format: "9 1234 5678" },
  { code: "+57", country: "Colômbia", flag: "🇨🇴", phoneLength: 10, format: "301 234 5678" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪", phoneLength: 10, format: "412 1234567" },
  { code: "+593", country: "Equador", flag: "🇪🇨", phoneLength: 9, format: "99 123 4567" },
  { code: "+51", country: "Peru", flag: "🇵🇪", phoneLength: 9, format: "912 345 678" },
  { code: "+598", country: "Uruguai", flag: "🇺🇾", phoneLength: 8, format: "94 123 456" },
  { code: "+595", country: "Paraguai", flag: "🇵🇾", phoneLength: 9, format: "981 123456" },
  { code: "+591", country: "Bolívia", flag: "🇧🇴", phoneLength: 8, format: "7123 4567" },
  { code: "+244", country: "Angola", flag: "🇦🇴", phoneLength: 9, format: "923 123 456" },
  { code: "+258", country: "Moçambique", flag: "🇲🇿", phoneLength: 9, format: "84 123 4567" },
  { code: "+238", country: "Cabo Verde", flag: "🇨🇻", phoneLength: 7, format: "991 2345" },
  { code: "+245", country: "Guiné-Bissau", flag: "🇬🇼", phoneLength: 7, format: "955 1234" },
  { code: "+239", country: "São Tomé e Príncipe", flag: "🇸🇹", phoneLength: 7, format: "990 1234" },
  { code: "+670", country: "Timor-Leste", flag: "🇹🇱", phoneLength: 8, format: "7723 4567" },
  { code: "+853", country: "Macau", flag: "🇲🇴", phoneLength: 8, format: "6612 3456" },
  { code: "+86", country: "China", flag: "🇨🇳", phoneLength: 11, format: "131 2345 6789" },
  { code: "+81", country: "Japão", flag: "🇯🇵", phoneLength: 10, format: "90 1234 5678" },
  { code: "+82", country: "Coreia do Sul", flag: "🇰🇷", phoneLength: [10, 11], format: "10 1234 5678" },
  { code: "+91", country: "Índia", flag: "🇮🇳", phoneLength: 10, format: "98765 43210" },
  { code: "+61", country: "Austrália", flag: "🇦🇺", phoneLength: 9, format: "412 345 678" },
  { code: "+64", country: "Nova Zelândia", flag: "🇳🇿", phoneLength: [8, 9], format: "21 123 4567" },
  { code: "+27", country: "África do Sul", flag: "🇿🇦", phoneLength: 9, format: "71 123 4567" },
  { code: "+20", country: "Egito", flag: "🇪🇬", phoneLength: 10, format: "100 123 4567" },
  { code: "+212", country: "Marrocos", flag: "🇲🇦", phoneLength: 9, format: "612 345678" },
  { code: "+971", country: "Emirados Árabes", flag: "🇦🇪", phoneLength: 9, format: "50 123 4567" },
  { code: "+966", country: "Arábia Saudita", flag: "🇸🇦", phoneLength: 9, format: "50 123 4567" },
  { code: "+972", country: "Israel", flag: "🇮🇱", phoneLength: 9, format: "50 123 4567" },
  { code: "+90", country: "Turquia", flag: "🇹🇷", phoneLength: 10, format: "532 123 4567" },
  { code: "+7", country: "Rússia", flag: "🇷🇺", phoneLength: 10, format: "912 345 6789" },
  { code: "+48", country: "Polónia", flag: "🇵🇱", phoneLength: 9, format: "512 345 678" },
  { code: "+380", country: "Ucrânia", flag: "🇺🇦", phoneLength: 9, format: "50 123 4567" },
  { code: "+30", country: "Grécia", flag: "🇬🇷", phoneLength: 10, format: "691 234 5678" },
  { code: "+45", country: "Dinamarca", flag: "🇩🇰", phoneLength: 8, format: "20 12 34 56" },
  { code: "+46", country: "Suécia", flag: "🇸🇪", phoneLength: 9, format: "70 123 45 67" },
  { code: "+47", country: "Noruega", flag: "🇳🇴", phoneLength: 8, format: "412 34 567" },
  { code: "+358", country: "Finlândia", flag: "🇫🇮", phoneLength: [9, 10], format: "41 234 5678" },
  { code: "+353", country: "Irlanda", flag: "🇮🇪", phoneLength: 9, format: "85 123 4567" },
  { code: "+352", country: "Luxemburgo", flag: "🇱🇺", phoneLength: 9, format: "621 123 456" },
  { code: "+420", country: "República Checa", flag: "🇨🇿", phoneLength: 9, format: "601 123 456" },
  { code: "+36", country: "Hungria", flag: "🇭🇺", phoneLength: 9, format: "20 123 4567" },
  { code: "+40", country: "Roménia", flag: "🇷🇴", phoneLength: 9, format: "712 345 678" },
  { code: "+359", country: "Bulgária", flag: "🇧🇬", phoneLength: 9, format: "88 123 4567" },
  { code: "+385", country: "Croácia", flag: "🇭🇷", phoneLength: 9, format: "91 234 5678" },
  { code: "+386", country: "Eslovénia", flag: "🇸🇮", phoneLength: 8, format: "31 234 567" },
  { code: "+421", country: "Eslováquia", flag: "🇸🇰", phoneLength: 9, format: "902 123 456" },
  { code: "+372", country: "Estónia", flag: "🇪🇪", phoneLength: [7, 8], format: "5123 4567" },
  { code: "+371", country: "Letónia", flag: "🇱🇻", phoneLength: 8, format: "2012 3456" },
  { code: "+370", country: "Lituânia", flag: "🇱🇹", phoneLength: 8, format: "612 34567" },
  { code: "+356", country: "Malta", flag: "🇲🇹", phoneLength: 8, format: "7912 3456" },
  { code: "+357", country: "Chipre", flag: "🇨🇾", phoneLength: 8, format: "96 123456" },
  { code: "+354", country: "Islândia", flag: "🇮🇸", phoneLength: 7, format: "611 1234" },
  { code: "+65", country: "Singapura", flag: "🇸🇬", phoneLength: 8, format: "9123 4567" },
  { code: "+60", country: "Malásia", flag: "🇲🇾", phoneLength: [9, 10], format: "12 345 6789" },
  { code: "+66", country: "Tailândia", flag: "🇹🇭", phoneLength: 9, format: "81 234 5678" },
  { code: "+84", country: "Vietname", flag: "🇻🇳", phoneLength: 9, format: "91 234 5678" },
  { code: "+62", country: "Indonésia", flag: "🇮🇩", phoneLength: [10, 11], format: "812 3456 7890" },
  { code: "+63", country: "Filipinas", flag: "🇵🇭", phoneLength: 10, format: "917 123 4567" },
  { code: "+92", country: "Paquistão", flag: "🇵🇰", phoneLength: 10, format: "300 1234567" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", phoneLength: 10, format: "1712 345678" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", phoneLength: 9, format: "71 234 5678" },
  { code: "+977", country: "Nepal", flag: "🇳🇵", phoneLength: 10, format: "984 1234567" },
  { code: "+855", country: "Camboja", flag: "🇰🇭", phoneLength: 9, format: "12 345 678" },
  { code: "+856", country: "Laos", flag: "🇱🇦", phoneLength: 10, format: "20 12 345 678" },
  { code: "+95", country: "Myanmar", flag: "🇲🇲", phoneLength: 9, format: "9 1234 5678" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰", phoneLength: 8, format: "5123 4567" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼", phoneLength: 9, format: "912 345 678" },
];

// Validate phone number length for a given country code
export const validatePhoneNumber = (phoneNumber: string, countryCode: string): {
  isValid: boolean;
  message: string;
  expectedLength: number | number[];
} => {
  const country = countryCodes.find(c => c.code === countryCode);
  
  if (!country) {
    return { isValid: true, message: "", expectedLength: 9 };
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "");
  const expectedLength = country.phoneLength;
  
  if (digitsOnly.length === 0) {
    return { isValid: true, message: "", expectedLength };
  }

  // Check if length matches expected
  if (Array.isArray(expectedLength)) {
    const minLength = Math.min(...expectedLength);
    const maxLength = Math.max(...expectedLength);
    
    if (digitsOnly.length < minLength) {
      return {
        isValid: false,
        message: `Número muito curto. ${country.country} requer ${minLength}-${maxLength} dígitos`,
        expectedLength
      };
    }
    
    if (digitsOnly.length > maxLength) {
      return {
        isValid: false,
        message: `Número muito longo. ${country.country} requer ${minLength}-${maxLength} dígitos`,
        expectedLength
      };
    }
    
    return { isValid: true, message: `Formato válido (${digitsOnly.length} dígitos)`, expectedLength };
  } else {
    if (digitsOnly.length < expectedLength) {
      return {
        isValid: false,
        message: `Número muito curto. ${country.country} requer ${expectedLength} dígitos`,
        expectedLength
      };
    }
    
    if (digitsOnly.length > expectedLength) {
      return {
        isValid: false,
        message: `Número muito longo. ${country.country} requer ${expectedLength} dígitos`,
        expectedLength
      };
    }
    
    return { isValid: true, message: `Formato válido (${expectedLength} dígitos)`, expectedLength };
  }
};

// Get placeholder format for a country
export const getPhonePlaceholder = (countryCode: string): string => {
  const country = countryCodes.find(c => c.code === countryCode);
  return country?.format || "912 345 678";
};

// Get expected length display text
export const getExpectedLengthText = (countryCode: string): string => {
  const country = countryCodes.find(c => c.code === countryCode);
  if (!country) return "";
  
  if (Array.isArray(country.phoneLength)) {
    const min = Math.min(...country.phoneLength);
    const max = Math.max(...country.phoneLength);
    return `${min}-${max} dígitos`;
  }
  
  return `${country.phoneLength} dígitos`;
};
