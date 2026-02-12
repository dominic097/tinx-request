// Dynamic variables generator (Postman-style)
export const dynamicVariables: Record<string, () => string> = {
  // GUIDs
  $guid: () => crypto.randomUUID(),
  $uuid: () => crypto.randomUUID(),

  // Timestamps
  $timestamp: () => Math.floor(Date.now() / 1000).toString(),
  $isoTimestamp: () => new Date().toISOString(),

  // Random Numbers
  $randomInt: () => Math.floor(Math.random() * 1000).toString(),
  $randomDigit: () => Math.floor(Math.random() * 10).toString(),
  $randomFloat: () => (Math.random() * 100).toFixed(2),

  // Random Strings
  $randomAlphaNumeric: () => Math.random().toString(36).substring(2, 3),
  $randomBoolean: () => (Math.random() > 0.5).toString(),
  $randomHexColor: () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
  $randomAbbreviation: () => ['HTTP', 'API', 'JSON', 'XML', 'REST', 'SOAP'][Math.floor(Math.random() * 6)],

  // Random Text
  $randomIP: () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  $randomIPV6: () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16)).join(':'),
  $randomMACAddress: () => Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
  $randomPassword: () => Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + Math.floor(Math.random() * 1000),

  // Random Locations
  $randomLocale: () => ['en_US', 'en_GB', 'fr_FR', 'de_DE', 'es_ES', 'it_IT', 'ja_JP', 'zh_CN'][Math.floor(Math.random() * 8)],
  $randomCountry: () => ['USA', 'UK', 'France', 'Germany', 'Spain', 'Italy', 'Japan', 'China'][Math.floor(Math.random() * 8)],
  $randomCountryCode: () => ['US', 'GB', 'FR', 'DE', 'ES', 'IT', 'JP', 'CN'][Math.floor(Math.random() * 8)],
  $randomCity: () => ['New York', 'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Tokyo', 'Beijing'][Math.floor(Math.random() * 8)],
  $randomStreetName: () => ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake'][Math.floor(Math.random() * 8)] + ' Street',
  $randomStreetAddress: () => Math.floor(Math.random() * 9999) + ' ' + dynamicVariables.$randomStreetName(),

  // Random Names
  $randomFirstName: () => ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Emma', 'David', 'Sarah'][Math.floor(Math.random() * 8)],
  $randomLastName: () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)],
  $randomFullName: () => dynamicVariables.$randomFirstName() + ' ' + dynamicVariables.$randomLastName(),
  $randomNamePrefix: () => ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'][Math.floor(Math.random() * 5)],
  $randomNameSuffix: () => ['Jr.', 'Sr.', 'II', 'III', 'IV'][Math.floor(Math.random() * 5)],

  // Random Internet
  $randomEmail: () => dynamicVariables.$randomFirstName().toLowerCase() + '.' + dynamicVariables.$randomLastName().toLowerCase() + '@example.com',
  $randomUserName: () => dynamicVariables.$randomFirstName().toLowerCase() + Math.floor(Math.random() * 1000),
  $randomUrl: () => 'https://' + dynamicVariables.$randomDomainName(),
  $randomDomainName: () => ['example', 'test', 'demo', 'sample'][Math.floor(Math.random() * 4)] + '.com',
  $randomDomainSuffix: () => ['com', 'net', 'org', 'io', 'co'][Math.floor(Math.random() * 5)],
  $randomDomainWord: () => ['example', 'test', 'demo', 'sample', 'api', 'app'][Math.floor(Math.random() * 6)],
  $randomProtocol: () => ['http', 'https'][Math.floor(Math.random() * 2)],

  // Random File & Images
  $randomFileName: () => dynamicVariables.$randomWord() + '.' + dynamicVariables.$randomFileExt(),
  $randomFileExt: () => ['txt', 'pdf', 'doc', 'jpg', 'png', 'gif', 'mp4', 'zip'][Math.floor(Math.random() * 8)],
  $randomFileType: () => ['audio', 'image', 'text', 'video', 'application'][Math.floor(Math.random() * 5)],
  $randomImageUrl: () => `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`,
  $randomAvatarImage: () => `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,

  // Random Commerce
  $randomProduct: () => ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Speaker'][Math.floor(Math.random() * 8)],
  $randomProductName: () => dynamicVariables.$randomWord() + ' ' + dynamicVariables.$randomProduct(),
  $randomPrice: () => (Math.random() * 1000).toFixed(2),
  $randomProductAdjective: () => ['Awesome', 'Amazing', 'Fantastic', 'Incredible', 'Premium', 'Deluxe'][Math.floor(Math.random() * 6)],
  $randomProductMaterial: () => ['Steel', 'Plastic', 'Wood', 'Aluminum', 'Cotton', 'Leather'][Math.floor(Math.random() * 6)],
  $randomDepartment: () => ['Electronics', 'Clothing', 'Home', 'Garden', 'Sports', 'Toys', 'Books'][Math.floor(Math.random() * 7)],

  // Random Company
  $randomCompanyName: () => dynamicVariables.$randomLastName() + ' ' + ['Inc', 'Corp', 'LLC', 'Ltd'][Math.floor(Math.random() * 4)],
  $randomCompanySuffix: () => ['Inc', 'Corp', 'LLC', 'Ltd', 'Group'][Math.floor(Math.random() * 5)],
  $randomBs: () => ['synergize', 'leverage', 'innovate', 'optimize', 'transform'][Math.floor(Math.random() * 5)],
  $randomCatchPhrase: () => 'We ' + dynamicVariables.$randomBs() + ' your business',

  // Random Bank
  $randomBankAccount: () => Math.floor(Math.random() * 90000000) + 10000000 + '',
  $randomBankAccountName: () => dynamicVariables.$randomFullName() + ' Checking',
  $randomCreditCardNumber: () => '4' + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join(''),
  $randomCreditCardMask: () => '**** **** **** ' + Math.floor(Math.random() * 9000 + 1000),
  $randomBitcoin: () => '1' + Array.from({ length: 33 }, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join(''),

  // Random Date
  $randomDateFuture: () => new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  $randomDatePast: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  $randomDateRecent: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  $randomWeekday: () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 7)],
  $randomMonth: () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Math.floor(Math.random() * 12)],

  // Random Lorem
  $randomWord: () => ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'][Math.floor(Math.random() * 8)],
  $randomWords: () => Array.from({ length: 3 }, () => dynamicVariables.$randomWord()).join(' '),
  $randomPhrase: () => dynamicVariables.$randomWords() + ' ' + dynamicVariables.$randomWords(),
  $randomLoremWord: () => dynamicVariables.$randomWord(),
  $randomLoremWords: () => dynamicVariables.$randomWords(),
  $randomLoremSentence: () => dynamicVariables.$randomPhrase() + '.',
  $randomLoremParagraph: () => Array.from({ length: 3 }, () => dynamicVariables.$randomLoremSentence()).join(' '),
};

// Replace dynamic variables in a string
export function replaceDynamicVariables(input: string): string {
  let result = input;

  // Match {{$variableName}} pattern
  const regex = /\{\{\s*(\$\w+)\s*\}\}/g;
  const matches = input.matchAll(regex);

  for (const match of matches) {
    const variableName = match[1];
    if (variableName in dynamicVariables) {
      const value = dynamicVariables[variableName]();
      result = result.replace(match[0], value);
    }
  }

  return result;
}

// Get all available dynamic variables
export function getAllDynamicVariables(): string[] {
  return Object.keys(dynamicVariables);
}
