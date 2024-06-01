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