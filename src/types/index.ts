// HTTP Methods
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];

// Request Body Types
export const BodyType = {
  NONE: 'none',
  JSON: 'json',
  XML: 'xml',
  TEXT: 'text',
  HTML: 'html',
  JAVASCRIPT: 'javascript',
  FORM_DATA: 'form-data',
  URL_ENCODED: 'x-www-form-urlencoded',
  BINARY: 'binary',
  GRAPHQL: 'graphql',
} as const;

export type BodyType = typeof BodyType[keyof typeof BodyType];

// Authentication Types
export const AuthType = {
  NONE: 'none',
  BASIC: 'basic',
  BEARER: 'bearer',
  API_KEY: 'api-key',
  OAUTH1: 'oauth1',
  OAUTH2: 'oauth2',
  HAWK: 'hawk',
  AWS_SIGNATURE: 'aws-signature',
  NTLM: 'ntlm',
} as const;

export type AuthType = typeof AuthType[keyof typeof AuthType];

// Header
export interface Header {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

// Query Parameter
export interface QueryParam {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

// Path Variable
export interface PathVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
}

// Form Data Item
export interface FormDataItem {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  description?: string;
  enabled: boolean;
}

// Request Body
export interface RequestBody {
  type: BodyType;
  raw?: string;
  formData?: FormDataItem[];
  binary?: File;
  graphql?: {
    query: string;
    variables?: string;
  };
}

// Authentication Config
export interface AuthConfig {
  type: AuthType;
  basic?: {
    username: string;
    password: string;
  };
  bearer?: {
    token: string;
  };
  apiKey?: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
  oauth2?: {
    accessToken: string;
    tokenType?: string;
  };
}

// Request
export interface Request {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body?: RequestBody;
  auth?: AuthConfig;
  params: QueryParam[];
  pathVariables: PathVariable[];
  preRequestScript?: string;
  testScript?: string;
  description?: string;
  collectionId?: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Response
export interface Response {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  size: number;
  time: number;
  timestamp: Date;
}

// Folder
export interface Folder {
  id: string;
  name: string;
  description?: string;
  collectionId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Variable
export interface Variable {
  id: string;
  key: string;
  value: string;
  type: 'default' | 'secret';
  enabled: boolean;
  description?: string;
}

// Collection
export interface Collection {
  id: string;
  name: string;
  description?: string;
  variables: Variable[];
  auth?: AuthConfig;
  preRequestScript?: string;
  testScript?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Environment
export interface Environment {
  id: string;
  name: string;
  variables: Variable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// History Item
export interface HistoryItem {
  id: string;
  request: Request;
  response: Response;
  timestamp: Date;
}

// Workspace
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Test Result
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

// Collection Run Result
export interface CollectionRunResult {
  id: string;
  collectionId: string;
  startTime: Date;
  endTime: Date;
  totalRequests: number;
  passedRequests: number;
  failedRequests: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: {
    requestId: string;
    requestName: string;
    response: Response;
    tests: TestResult[];
  }[];
}
