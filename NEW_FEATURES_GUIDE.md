# 🚀 New Features Guide - Tinx API Client

## Table of Contents
1. [Form-Data Body with File Uploads](#form-data-body-with-file-uploads)
2. [Data-Driven Testing](#data-driven-testing)
3. [GitHub Integration](#github-integration)
4. [Enhanced Import/Export](#enhanced-importexport)

---

## 📤 Form-Data Body with File Uploads

### Overview
Send multipart/form-data requests with file uploads, perfect for testing file upload endpoints.

### Features
- ✅ Multiple file uploads in a single request
- ✅ Mix text fields and file fields
- ✅ Enable/disable individual fields
- ✅ File metadata tracking
- ✅ Support for any file type

### Implementation Files
- `src/lib/formData.ts` - Form data handling utilities
- Request Builder component enhanced with file upload UI

### Usage

**In Request Builder:**
1. Select "Body" tab
2. Choose "Form Data" option
3. Add fields with type "text" or "file"
4. For file fields, click "Choose File" to select files
5. Enable/disable fields as needed
6. Send request

**Programmatic Usage:**
```typescript
import { buildFormData, FormDataField } from '@/lib/formData';

const fields: FormDataField[] = [
  {
    id: '1',
    key: 'username',
    value: 'john',
    type: 'text',
    enabled: true,
  },
  {
    id: '2',
    key: 'avatar',
    value: '',
    type: 'file',
    file: selectedFile, // File object
    enabled: true,
  },
];

const formData = buildFormData(fields);
// Use formData in your request
```

---

## 🔄 Data-Driven Testing

### Overview
Run the same request multiple times with different data sets from CSV or JSON files. Perfect for testing with multiple user credentials, test cases, or scenarios.

### Features
- ✅ CSV file support
- ✅ JSON file support
- ✅ Variable substitution with `{{data.variableName}}`
- ✅ Automatic type detection (string, number, boolean)
- ✅ Data validation
- ✅ Sample template generation

### Implementation Files
- `src/lib/dataDrivenTesting.ts` - Data parsing and substitution utilities

### CSV Format Example
```csv
username,password,expectedStatus
user1,pass123,200
user2,pass456,200
user3,wrongpass,401
```

### JSON Format Example
```json
[
  { "username": "user1", "password": "pass123", "expectedStatus": 200 },
  { "username": "user2", "password": "pass456", "expectedStatus": 200 },
  { "username": "user3", "password": "wrongpass", "expectedStatus": 401 }
]
```

### Usage in Collection Runner

1. **Prepare Your Data File**
   - Create CSV or JSON file with your test data
   - First row in CSV = column headers
   - JSON must be an array of objects

2. **Use Variables in Your Request**
   ```
   URL: https://api.example.com/login
   Body: {
     "username": "{{data.username}}",
     "password": "{{data.password}}"
   }
   ```

3. **Add Test Assertions**
   ```javascript
   pm.test("Status code matches expected", () => {
       pm.expect(pm.response.code).to.equal({{data.expectedStatus}});
   });
   ```

4. **Run Collection with Data**
   - Open Collection Runner
   - Select your collection
   - Upload data file (CSV/JSON)
   - Click "Run with Data"
   - Each row will be executed as a separate iteration

### Programmatic Usage

```typescript
import { loadDataFile, substituteDataVariables } from '@/lib/dataDrivenTesting';

// Load data from file
const dataRows = await loadDataFile(file);

// Iterate through data
for (const row of dataRows) {
  // Substitute variables
  const url = substituteDataVariables('https://api.example.com/users/{{data.userId}}', row);
  const body = substituteDataVariables('{"name": "{{data.name}}"}', row);
  
  // Make request with substituted values
  // ...
}
```

### Sample Templates

**Generate CSV Template:**
```typescript
import { generateCSVTemplate } from '@/lib/dataDrivenTesting';
const template = generateCSVTemplate();
// Download or display template
```

**Generate JSON Template:**
```typescript
import { generateJSONTemplate } from '@/lib/dataDrivenTesting';
const template = generateJSONTemplate();
// Download or display template
```

---

## 🔗 GitHub Integration

### Overview
Store and sync your API collections in a GitHub repository for backup, version control, and team collaboration.

### Features
- ✅ Push collections to GitHub
- ✅ Pull collections from GitHub
- ✅ Automatic version control
- ✅ Branch support
- ✅ Private repository support
- ✅ 100% client-side (no backend)
- ✅ Secure token storage (local only)

### Implementation Files
- `src/lib/githubIntegration.ts` - GitHub API integration
- `src/components/features/GitHubAuth.tsx` - Authentication UI
- `src/components/features/GitHubSync.tsx` - Sync management UI

### Setup Instructions

#### 1. Create GitHub Repository
```bash
# Create a new repository on GitHub (can be private)
# Example: https://github.com/username/my-api-collections
```

#### 2. Generate Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Tinx API Client"
4. Select scope: `repo` (for private repos) or `public_repo` (for public repos)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

#### 3. Connect Tinx to GitHub
1. Open Tinx settings
2. Go to "GitHub Integration"
3. Enter your details:
   - **Token**: Your personal access token
   - **Owner**: Your GitHub username
   - **Repository**: Repository name (e.g., `my-api-collections`)
   - **Branch**: `main` (or your preferred branch)
4. Click "Connect to GitHub"

#### 4. Sync Your Collections

**Push (Upload):**
- Click "Push to GitHub" to upload all your collections
- Each collection is saved as a separate JSON file
- Files are stored in `tinx-collections/` directory

**Pull (Download):**
- Click "Pull from GitHub" to download collections
- This will overwrite your local collections

### File Structure in GitHub
```
your-repo/
└── tinx-collections/
    ├── my_collection_1_abc123.json
    ├── another_collection_def456.json
    └── test_apis_ghi789.json
```

### Security & Privacy

**Your data is safe:**
- ✅ Token stored locally in browser (never sent to third parties)
- ✅ Direct communication with GitHub API
- ✅ No intermediary servers
- ✅ You control the repository
- ✅ Can use private repositories

**Best Practices:**
- Use private repositories for sensitive APIs
- Rotate tokens periodically
- Don't commit sensitive data (passwords, API keys)
- Use environment variables for secrets

### Programmatic Usage

```typescript
import { GitHubService, saveGitHubConfig } from '@/lib/githubIntegration';

// Configure GitHub
const config = {
  token: 'ghp_xxxxxxxxxxxx',
  owner: 'username',
  repo: 'my-api-collections',
  branch: 'main',
};

saveGitHubConfig(config);
const github = new GitHubService(config);

// Save a collection
await github.saveFile(
  {
    path: 'tinx-collections/my-collection.json',
    content: JSON.stringify(collectionData, null, 2),
  },
  'Update my collection'
);

// Get a collection
const file = await github.getFile('tinx-collections/my-collection.json');
console.log(file?.content);

// List all collections
const files = await github.listFiles('tinx-collections');
```

---

## 📦 Enhanced Import/Export

### Overview
Import and export collections in multiple formats for compatibility with other API clients.

### Supported Formats

#### Export Formats
- ✅ **Postman Collection v2.1** - Full compatibility
- ✅ **Tinx Native Format** - Preserves all features
- 🔜 **OpenAPI 3.0** - Coming soon
- 🔜 **Insomnia** - Coming soon

#### Import Formats
- ✅ **Postman Collection** - Import from Postman
- ✅ **Tinx Native Format** - Import Tinx backups
- 🔜 **OpenAPI 3.0** - Coming soon
- 🔜 **Insomnia** - Coming soon

### Implementation Files
- `src/lib/importExport.ts` - Core import/export logic (enhanced)
- `src/components/features/EnhancedImportExport.tsx` - UI component

### Export Options

#### 1. Export Selected Collection
- Exports the currently selected collection
- Choose format: Postman or Tinx
- Downloads as JSON file

#### 2. Export Environment
- Exports the active environment
- Includes all variables
- Tinx format only

#### 3. Export All Data (Backup)
- Complete backup of all data
- Includes:
  - All collections
  - All requests
  - All environments
- Tinx format only
- Perfect for migration or backup

### Import Options

#### 1. Import Postman Collection
- Supports Postman Collection v2.1 format
- Automatically converts to Tinx format
- Creates new collection with all requests

#### 2. Import Tinx Format
- Native format import
- Supports:
  - Single collection files
  - Full backup files
- Preserves all metadata

### Usage

**Export Collection:**
```typescript
import { exportToPostman, downloadFile } from '@/lib/importExport';

const json = exportToPostman(collection, requests);
downloadFile(json, 'my-collection.postman_collection.json');
```

**Import Collection:**
```typescript
import { importFromPostman, readFile } from '@/lib/importExport';

const content = await readFile(file);
const { collection, requests } = importFromPostman(content);
// Create collection and requests in your app
```

**Full Backup:**
```typescript
const backup = {
  version: '1.0',
  exportedAt: new Date().toISOString(),
  collections: collections.map(c => ({
    collection: c,
    requests: requests.filter(r => r.collectionId === c.id),
  })),
  environments,
};

downloadFile(JSON.stringify(backup, null, 2), 'tinx-backup.json');
```

### File Formats

#### Tinx Native Format
```json
{
  "version": "1.0",
  "exportedAt": "2026-02-12T05:00:00.000Z",
  "collection": {
    "id": "abc123",
    "name": "My API Collection",
    "description": "Test APIs",
    "variables": [],
    "createdAt": "2026-02-12T05:00:00.000Z",
    "updatedAt": "2026-02-12T05:00:00.000Z"
  },
  "requests": [
    {
      "id": "req1",
      "name": "Get Users",
      "method": "GET",
      "url": "https://api.example.com/users",
      "headers": [],
      "params": [],
      "pathVariables": [],
      "collectionId": "abc123"
    }
  ]
}
```

---

## 🎯 Quick Start Guide

### 1. Form-Data with Files
```
1. Create new request
2. Body → Form Data
3. Add field → Type: File
4. Choose file
5. Send request
```

### 2. Data-Driven Testing
```
1. Create CSV/JSON with test data
2. Use {{data.variable}} in request
3. Collection Runner → Upload data file
4. Run with data
```

### 3. GitHub Sync
```
1. Settings → GitHub Integration
2. Enter token + repo details
3. Connect
4. Push/Pull collections
```

### 4. Import/Export
```
1. Settings → Import/Export
2. Choose format
3. Export: Select collection → Export
4. Import: Choose file → Import
```

---

## 🐛 Troubleshooting

### Form-Data Issues
- **File not uploading**: Check file size limits
- **Wrong content-type**: Ensure multipart/form-data is set

### Data-Driven Testing
- **Variables not substituting**: Check syntax `{{data.variableName}}`
- **CSV parsing errors**: Ensure proper comma separation
- **Type conversion**: Use quotes for strings in CSV

### GitHub Integration
- **Connection failed**: Verify token has `repo` scope
- **Push failed**: Check repository permissions
- **Pull failed**: Ensure files exist in repository

### Import/Export
- **Import failed**: Verify file format is correct
- **Missing data**: Some formats don't support all features
- **Encoding issues**: Ensure UTF-8 encoding

---

## 📚 API Reference

See individual implementation files for detailed API documentation:
- `src/lib/formData.ts`
- `src/lib/dataDrivenTesting.ts`
- `src/lib/githubIntegration.ts`
- `src/lib/importExport.ts`

---

## 🤝 Contributing

To add new features or improve existing ones:
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

**Last Updated**: February 12, 2026  
**Version**: 2.0.0  
**Status**: ✅ Production Ready