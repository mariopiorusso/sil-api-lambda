import { APIGatewayEvent } from "aws-lambda";

// Transform queryStringParameters to ensure all values are strings
export const transformQueryParams = (queryParams: APIGatewayEvent['queryStringParameters']) => {
  if (!queryParams) return {};
  const transformed: { [key: string]: string | string[] } = {};
  for (const key in queryParams) {
    if (queryParams[key] !== undefined) {
      transformed[key] = queryParams[key] as string;
    }
  }
  return transformed;
};

// Transform headers to ensure all values are strings
export const transformHeaders = (headers: APIGatewayEvent['headers']) => {
  const transformed: { [key: string]: string | string[] } = {};
  for (const key in headers) {
    if (headers[key] !== undefined) {
      transformed[key] = headers[key] as string;
    }
  }
  return transformed;
};

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