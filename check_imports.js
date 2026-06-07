const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/admin/AIMatchingPage.tsx',
  'src/pages/admin/AnalyticsPage.tsx',
  'src/pages/admin/BackupWorkflowPage.tsx',
  'src/pages/admin/BloodRequestsPage.tsx',
  'src/pages/admin/CreateRequestPage.tsx',
  'src/pages/admin/DashboardPage.tsx',
  'src/pages/admin/DonorDetailPage.tsx',
  'src/pages/admin/DonorManagementPage.tsx',
  'src/pages/admin/InsightsPage.tsx',
  'src/pages/admin/NotificationsPage.tsx',
  'src/pages/admin/RequestDetailPage.tsx',
  'src/pages/admin/SettingsPage.tsx',
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  const imports = [];
  let inImport = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('import ')) {
      inImport = true;
    }
    if (inImport) {
      // Extract names from import
      const match = line.match(/import\s+(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))/);
      if (match) {
        if (match[1]) {
          match[1].split(',').forEach(name => {
            const cleanName = name.trim().split(' as ')[0].trim();
            if (cleanName) imports.push(cleanName);
          });
        } else if (match[2]) {
          imports.push(match[2]);
        } else if (match[3]) {
          imports.push(match[3]);
        }
      }
      if (!line.includes('from')) inImport = false;
    }
  }
  
  console.log(`\n${path.basename(file)}:`);
  console.log(`  Imported: ${imports.join(', ') || 'none'}`);
});
