// Data-driven testing - CSV/JSON iteration for collection runner

export interface DataRow {
  [key: string]: string | number | boolean;
}

/**
 * Parse CSV content into array of objects
 */
export function parseCSV(content: string): DataRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: DataRow = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Try to parse as number or boolean
      if (value === 'true') {
        row[header] = true;
      } else if (value === 'false') {
        row[header] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        row[header] = Number(value);
      } else {
        row[header] = value;
      }
    });
    
    rows.push(row);
  }

  return rows;
}

/**
 * Parse JSON content into array of objects
 */
export function parseJSON(content: string): DataRow[] {
  const data = JSON.parse(content);
  
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects');
  }
  
  return data;
}

/**
 * Substitute variables in a string using data row
 */
export function substituteDataVariables(input: string, data: DataRow): string {
  let result = input;
  
  // Replace {{data.variableName}} pattern
  const regex = /\{\{\s*data\.(\w+)\s*\}\}/g;
  const matches = input.matchAll(regex);
  
  for (const match of matches) {
    const variableName = match[1];
    if (variableName in data) {
      const value = String(data[variableName]);
      result = result.replace(match[0], value);
    }
  }
  
  return result;
}

/**
 * Substitute data variables in headers
 */
export function substituteDataInHeaders(
  headers: Record<string, string>,
  data: DataRow
): Record<string, string> {
  const substituted: Record<string, string> = {};
  
  Object.entries(headers).forEach(([key, value]) => {
    substituted[substituteDataVariables(key, data)] = substituteDataVariables(value, data);
  });
  
  return substituted;
}

/**
 * Load data from file
 */
export async function loadDataFile(file: File): Promise<DataRow[]> {
  const content = await file.text();
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(content);
    case 'json':
      return parseJSON(content);
    default:
      throw new Error(`Unsupported file format: ${extension}. Use CSV or JSON.`);
  }
}

/**
 * Validate data structure
 */
export function validateDataRows(rows: DataRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (rows.length === 0) {
    errors.push('No data rows found');
    return { valid: false, errors };
  }
  
  // Check if all rows have the same keys
  const firstRowKeys = Object.keys(rows[0]).sort();
  for (let i = 1; i < rows.length; i++) {
    const rowKeys = Object.keys(rows[i]).sort();
    if (JSON.stringify(firstRowKeys) !== JSON.stringify(rowKeys)) {
      errors.push(`Row ${i + 1} has different keys than the first row`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Generate sample CSV template
 */
export function generateCSVTemplate(): string {
  return `username,password,expectedStatus
user1,pass123,200
user2,pass456,200
user3,wrongpass,401`;
}

/**
 * Generate sample JSON template
 */
export function generateJSONTemplate(): string {
  return JSON.stringify([
    { username: 'user1', password: 'pass123', expectedStatus: 200 },
    { username: 'user2', password: 'pass456', expectedStatus: 200 },
    { username: 'user3', password: 'wrongpass', expectedStatus: 401 },
  ], null, 2);
}