/**
 * ERPNext/Frappe API Client
 * Handles authentication and data fetching from ERPNext system
 */

export interface ERPConfig {
  baseUrl: string;
  employeeId: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
}

export interface ERPCheckinRecord {
  name: string;
  employee: string;
  employee_name: string;
  log_type: 'IN' | 'OUT';
  time: string; // ISO format or DD-MM-YYYY HH:MM:SS
}

export class ERPClient {
  private config: ERPConfig;
  private isLoggedIn: boolean = false;

  constructor(config: ERPConfig) {
    this.config = config;
  }

  /**
   * Test connection to ERP system
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/method/ping`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        return { success: true, message: 'Connection successful!' };
      } else {
        return { success: false, message: `Connection failed: ${response.statusText}` };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'CORS Error: Cannot connect to ERP. Please install a CORS browser extension.',
        };
      }
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Fetch employee checkin records with automatic login
   */
  async fetchCheckinsWithAuth(startDate: string, endDate: string): Promise<string> {
    try {
      // Step 1: Login first if using username/password
      if (this.config.username && this.config.password && !this.isLoggedIn) {
        const loginResult = await this.login();
        if (!loginResult.success) {
          throw new Error(`Login failed: ${loginResult.message}`);
        }
        this.isLoggedIn = true;
      }

      // Step 2: Immediately fetch data using the same session
      return await this.fetchCheckins(startDate, endDate);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch employee checkin records
   */
  async fetchCheckins(startDate: string, endDate: string): Promise<string> {
    try {
      // Format dates for ERPNext API (YYYY-MM-DD)
      const formattedStartDate = this.formatDateForAPI(startDate);
      const formattedEndDate = this.formatDateForAPI(endDate);

      // ERPNext API endpoint for Employee Checkin
      const filters = JSON.stringify([
        ['employee', '=', this.config.employeeId],
        ['time', 'between', [formattedStartDate, formattedEndDate]],
      ]);

      const fields = JSON.stringify([
        'name',
        'employee',
        'employee_name',
        'log_type',
        'time',
      ]);

      const url = `${this.config.baseUrl}/api/resource/Employee Checkin?filters=${encodeURIComponent(
        filters
      )}&fields=${encodeURIComponent(fields)}&limit_page_length=1000&order_by=time asc`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for session-based auth
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API request failed: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData._error_message) {
            errorMessage = errorData._error_message;
          }
          if (errorData._server_messages) {
            const messages = JSON.parse(errorData._server_messages);
            if (messages.length > 0) {
              const msg = JSON.parse(messages[0]);
              if (msg.message) {
                errorMessage = msg.message.replace(/<[^>]*>/g, ''); // Remove HTML tags
              }
            }
          }
        } catch (e) {
          // If we can't parse the error, use the status text
        }

        // Check if it's a permission error (Guest user)
        if (response.status === 403 || errorMessage.includes('Guest') || errorMessage.includes('permission')) {
          throw new Error(
            'Authentication Failed: Session cookie not working due to CORS.\n\n' +
            'This is a browser security limitation. Your options:\n\n' +
            '1. EASIEST: Install "Allow CORS" Chrome extension\n' +
            '   → https://chrome.google.com/webstore/detail/lhobafahddgcelffkeicbaginigeejlf\n\n' +
            '2. BEST: Get API Key from ERP (User → API Access)\n\n' +
            '3. FALLBACK: Continue using manual copy-paste\n\n' +
            'The login worked, but cookies cannot be shared between localhost and ERP domain.'
          );
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from ERP');
      }

      if (data.data.length === 0) {
        throw new Error('No checkin records found for the specified date range and employee ID.');
      }

      // Convert to the format expected by the parser
      return this.convertToLogFormat(data.data);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          'CORS Error: Cannot connect to ERP directly from browser.\n\n' +
          'Solutions:\n' +
          '1. Install "Allow CORS" browser extension\n' +
          '2. Ask your IT admin to enable CORS for this domain\n' +
          '3. Use API Key authentication (more reliable)\n' +
          '4. Use the manual copy-paste method'
        );
      }
      throw error;
    }
  }

  /**
   * Convert ERP records to log format
   */
  private convertToLogFormat(records: ERPCheckinRecord[]): string {
    const lines: string[] = [];

    for (const record of records) {
      // Employee name
      lines.push(record.employee_name);

      // Log type (IN/OUT)
      lines.push(record.log_type);

      // Time in DD-MM-YYYY HH:MM:SS format
      const formattedTime = this.formatTimeForLog(record.time);
      lines.push(formattedTime);

      // Add separator lines (matching the original format)
      lines.push('Approved');
      lines.push('1 h');
      lines.push('0');
      lines.push('·');
      lines.push(''); // Empty line between records
    }

    return lines.join('\n');
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDateForAPI(date: string): string {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // If in DD-MM-YYYY format, convert
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    }

    // Try parsing as Date object
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return date;
  }

  /**
   * Format time for log (DD-MM-YYYY HH:MM:SS)
   */
  private formatTimeForLog(time: string): string {
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
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // API Key authentication
    if (this.config.apiKey && this.config.apiSecret) {
      headers['Authorization'] = `token ${this.config.apiKey}:${this.config.apiSecret}`;
    }

    return headers;
  }

  /**
   * Login with username and password (creates session)
   */
  async login(): Promise<{ success: boolean; message: string }> {
    if (!this.config.username || !this.config.password) {
      return { success: false, message: 'Username and password required' };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/api/method/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          usr: this.config.username,
          pwd: this.config.password,
        }),
      });

      if (response.ok) {
        this.isLoggedIn = true;
        const data = await response.json();
        return { 
          success: true, 
          message: `Login successful! Welcome ${data.full_name || 'User'}` 
        };
      } else {
        let errorMessage = 'Login failed';
        try {
          const data = await response.json();
          if (data.message) {
            errorMessage = data.message;
          } else if (data._server_messages) {
            const messages = JSON.parse(data._server_messages);
            if (messages.length > 0) {
              const msg = JSON.parse(messages[0]);
              if (msg.message) {
                errorMessage = msg.message.replace(/<[^>]*>/g, '');
              }
            }
          }
        } catch (e) {
          // Use default error message
        }
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'CORS Error: Cannot login directly from browser. Please install a CORS browser extension.',
        };
      }
      return {
        success: false,
        message: `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

/**
 * Storage keys for ERP configuration
 */
export const ERP_STORAGE_KEY = 'workHoursCalc_erpConfig';

/**
 * Save ERP configuration to localStorage
 */
export function saveERPConfig(config: ERPConfig): void {
  localStorage.setItem(ERP_STORAGE_KEY, JSON.stringify(config));
}

/**
 * Load ERP configuration from localStorage
 */
export function loadERPConfig(): ERPConfig | null {
  const saved = localStorage.getItem(ERP_STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/**
 * Clear ERP configuration from localStorage
 */
export function clearERPConfig(): void {
  localStorage.removeItem(ERP_STORAGE_KEY);
}
