// Form data handling with file upload support

export interface FormDataField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File;
  enabled: boolean;
  description?: string;
}

export function buildFormData(fields: FormDataField[]): FormData {
  const formData = new FormData();
  
  fields
    .filter(field => field.enabled && field.key)
    .forEach(field => {
      if (field.type === 'file' && field.file) {
        formData.append(field.key, field.file);
      } else if (field.type === 'text') {
        formData.append(field.key, field.value);
      }
    });
  
  return formData;
}

export function formDataToObject(fields: FormDataField[]): Record<string, any> {
  const obj: Record<string, any> = {};
  
  fields
    .filter(field => field.enabled && field.key)
    .forEach(field => {
      if (field.type === 'file' && field.file) {
        obj[field.key] = {
          filename: field.file.name,
          size: field.file.size,
          type: field.file.type,
        };
      } else {
        obj[field.key] = field.value;
      }
    });
  
  return obj;
}

export function serializeFormDataFields(fields: FormDataField[]): any[] {
  return fields.map(field => ({
    id: field.id,
    key: field.key,
    value: field.value,
    type: field.type,
    enabled: field.enabled,
    description: field.description,
    // Don't serialize the actual file, just metadata
    fileMetadata: field.file ? {
      name: field.file.name,
      size: field.file.size,
      type: field.file.type,
    } : undefined,
  }));
}

export function deserializeFormDataFields(data: any[]): FormDataField[] {
  return data.map(item => ({
    id: item.id || crypto.randomUUID(),
    key: item.key || '',
    value: item.value || '',
    type: item.type || 'text',
    enabled: item.enabled !== false,
    description: item.description,
    // File will need to be re-selected by user
  }));
}