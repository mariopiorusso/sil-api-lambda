export const convertToDynamoDBItem = (item: any): { [key: string]: AWS.DynamoDB.DocumentClient.AttributeValue } => {
  const dynamoItem: { [key: string]: AWS.DynamoDB.DocumentClient.AttributeValue } = {};
  for (const key in item) {
    if (item.hasOwnProperty(key)) {
      const value = item[key];
      if (typeof value === 'string') {
        dynamoItem[key] = { S: value };
      } else if (typeof value === 'number') {
        dynamoItem[key] = { N: value.toString() };
      } else if (typeof value === 'boolean') {
        dynamoItem[key] = { BOOL: value };
      } else if (Array.isArray(value)) {
        dynamoItem[key] = { L: value.map(v => ({ S: v })) };
      } else if (value && typeof value === 'object') {
        dynamoItem[key] = { M: convertToDynamoDBItem(value) };
      }
    }
  }
  return dynamoItem;
};

export const normalizeParams = (params: { [key: string]: string | undefined } | null): { [key: string]: string | string[] } => {
  const normalizedParams: { [key: string]: string | string[] } = {};
  if (params) {
    for (const key in params) {
      if (params[key] !== undefined) {
        normalizedParams[key] = params[key] as string;
      }
    }
  }
  return normalizedParams;
};

export const extractStringParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || '';
};