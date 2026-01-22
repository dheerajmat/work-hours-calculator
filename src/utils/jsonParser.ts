/**
 * Parse JSON response from ERPNext API
 */
export interface ERPJSONResponse {
  data: Array<{
    name: string;
    employee: string;
    employee_name: string;
    log_type: 'IN' | 'OUT';
    time: string;
  }>;
}

/**
 * Convert ERP JSON response to log format
 */
export function convertERPJSONToLogFormat(jsonData: ERPJSONResponse | string): string {
  try {
    // Parse if it's a string
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid JSON format. Expected format: { "data": [...] }');
    }

    const lines: string[] = [];

    for (const record of data.data) {
      // Employee name
      lines.push(record.employee_name);

      // Log type (IN/OUT)
      lines.push(record.log_type);

      // Time in DD-MM-YYYY HH:MM:SS format
      const formattedTime = formatTimeForLog(record.time);
      lines.push(formattedTime);

      // Add separator lines (matching the original format)
      lines.push('Approved');
      lines.push('1 h');
      lines.push('0');
      lines.push('·');
      lines.push(''); // Empty line between records
    }

    return lines.join('\n');
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid format'}`);
  }
}

/**
 * Format time for log (DD-MM-YYYY HH:MM:SS)
 */
function formatTimeForLog(time: string): string {
  const date = new Date(time);

  if (isNaN(date.getTime())) {
    return time; // Return as is if invalid
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Detect if input is JSON format
 */
export function isJSONFormat(text: string): boolean {
  const trimmed = text.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}
