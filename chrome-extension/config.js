// Configuration file for easy customization
// Edit these values to match your ERP structure

const CONFIG = {
  // ERP URL patterns (add your ERP URL here)
  erpUrls: [
    '*://*.erp.com/*',
    '*://erp.*/*',
    '*://*/attendance*',
    '*://*/checkin*',
    // Add your ERP URL pattern here:
    // '*://your-erp-domain.com/*'
  ],

  // Selectors for finding attendance data
  selectors: {
    // Table selectors
    tables: [
      'table',
      'table.attendance',
      'table.punch-records',
      '#attendance-table',
      // Add your table selector here
    ],
    
    // Card/Div selectors
    cards: [
      '[class*="attendance"]',
      '[class*="punch"]',
      '[class*="checkin"]',
      '.record-item',
      // Add your card selector here
    ],
    
    // Specific element selectors (if you know the exact structure)
    employeeName: null,  // e.g., '.employee-name'
    punchType: null,     // e.g., '.punch-type'
    datetime: null,      // e.g., '.punch-time'
  },

  // Data format settings
  format: {
    // Date format in your ERP (for validation)
    datePattern: /\d{2}[-/]\d{2}[-/]\d{4}/,
    
    // Time pattern
    timePattern: /\d{2}:\d{2}:\d{2}/,
    
    // IN/OUT pattern
    punchPattern: /IN|OUT/i,
  },

  // Output format
  output: {
    // Separator between records
    recordSeparator: '\n\n',
    
    // Separator between fields
    fieldSeparator: '\n',
    
    // Include status field?
    includeStatus: true,
  },

  // Debug settings
  debug: {
    // Show console logs?
    enabled: true,
    
    // Show detailed extraction info?
    verbose: false,
  }
};

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
