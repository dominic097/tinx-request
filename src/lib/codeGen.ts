import type { HttpMethod } from '@/types';

export interface CodeGenOptions {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export const codeGenerators = {
  // JavaScript - Fetch
  javascriptFetch: (options: CodeGenOptions): string => {
    const { method, url, headers, body } = options;

    const headersCode = Object.keys(headers).length > 0
      ? `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},`
      : '';

    const bodyCode = body && ['POST', 'PUT', 'PATCH'].includes(method)
      ? `  body: ${JSON.stringify(body)},`
      : '';

    return `fetch('${url}', {
  method: '${method}',${headersCode}${bodyCode ? '\n' + bodyCode : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  },

  // JavaScript - Axios
  javascriptAxios: (options: CodeGenOptions): string => {
    const { method, url, headers, body } = options;

    const headersCode = Object.keys(headers).length > 0
      ? `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},`
      : '';

    const bodyCode = body && ['POST', 'PUT', 'PATCH'].includes(method)
      ? `  data: ${JSON.stringify(body)},`
      : '';

    return `axios({
  method: '${method.toLowerCase()}',
  url: '${url}',${headersCode}${bodyCode ? '\n' + bodyCode : ''}
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;
  },

  // Python - Requests
  pythonRequests: (options: CodeGenOptions): string => {
    const { method, url, headers, body } = options;

    const headersCode = Object.keys(headers).length > 0
      ? `headers = ${JSON.stringify(headers, null, 2).replace(/"/g, "'")}\n`
      : '';

    const bodyCode = body && ['POST', 'PUT', 'PATCH'].includes(method)
      ? `data = ${JSON.stringify(body, null, 2).replace(/"/g, "'")}\n`
      : '';

    const paramsCode = `${headersCode ? ', headers=headers' : ''}${bodyCode ? ', json=data' : ''}`;

    return `import requests

${headersCode}${bodyCode}response = requests.${method.toLowerCase()}('${url}'${paramsCode})
print(response.json())`;
  },

  // cURL
  curl: (options: CodeGenOptions): string => {
    const { method, url, headers, body } = options;

    let cmd = `curl -X ${method} '${url}'`;

    Object.entries(headers).forEach(([key, value]) => {
      cmd += ` \\\n  -H '${key}: ${value}'`;
    });

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      cmd += ` \\\n  -d '${body.replace(/'/g, "\\'")}'`;
    }

    return cmd;
  },

  // Node.js - HTTP
  nodejsHttp: (options: CodeGenOptions): string => {
    const { method, url, headers, body } = options;
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';

    const headersCode = `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},`;

    return `const ${isHttps ? 'https' : 'http'} = require('${isHttps ? 'https' : 'http'}');

const options = {
  hostname: '${urlObj.hostname}',
  port: ${urlObj.port || (isHttps ? 443 : 80)},
  path: '${urlObj.pathname}${urlObj.search}',
  method: '${method}',
${headersCode}
};

const req = ${isHttps ? 'https' : 'http'}.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

req.on('error', (error) => console.error('Error:', error));
${body && ['POST', 'PUT', 'PATCH'].includes(method) ? `req.write(${JSON.stringify(body)});` : ''}
req.end();`;
  },

  // Go
  go: (options: CodeGenOptions): string => {
    const { method, url, headers, body } = options;

    const bodyCode = body && ['POST', 'PUT', 'PATCH'].includes(method)
      ? `\n\tbody := strings.NewReader(${JSON.stringify(body)})`
      : '';

    const bodyParam = body && ['POST', 'PUT', 'PATCH'].includes(method) ? 'body' : 'nil';

    return `package main

import (
\t"fmt"
\t"io"
\t"net/http"${bodyCode ? '\n\t"strings"' : ''}
)

func main() {${bodyCode}

\treq, err := http.NewRequest("${method}", "${url}", ${bodyParam})
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}

${Object.entries(headers).map(([key, value]) => `\treq.Header.Add("${key}", "${value}")`).join('\n')}

\tclient := &http.Client{}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tdefer resp.Body.Close()

\tbody, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(body))
}`;
  },
};

export const languages = [
  { id: 'javascriptFetch', name: 'JavaScript (Fetch)', language: 'javascript' },
  { id: 'javascriptAxios', name: 'JavaScript (Axios)', language: 'javascript' },
  { id: 'pythonRequests', name: 'Python (Requests)', language: 'python' },
  { id: 'curl', name: 'cURL', language: 'bash' },
  { id: 'nodejsHttp', name: 'Node.js (HTTP)', language: 'javascript' },
  { id: 'go', name: 'Go', language: 'go' },
];
