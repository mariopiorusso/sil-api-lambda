import { APIGatewayEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';
import OpenAPIBackend, { Request } from 'openapi-backend';
import { transformHeaders, transformQueryParams } from './utils/utils';

// Initialize the API
const api = new OpenAPIBackend({ definition: './openapi.json' });

// Register handlers
api.register({
  validationFail: (c, req, res) => res.status(400).json({ err: c.validation.errors }),
  notFound: (c, req, res) => res.status(404).json({ err: 'not found' }),
});

api.init();

// Define the response interface
interface LambdaResponse {
  status: (statusCode: number) => {
    json: (responseBody: any) => void;
  };
}

// Lambda handler
export const handler = async (event: APIGatewayEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
  const { httpMethod: method, path, queryStringParameters, headers, body } = event;

  const req: Request = {
    method,
    path,
    query: transformQueryParams(queryStringParameters),
    headers: transformHeaders(headers),
    body: body ? JSON.parse(body) : undefined,
  };

  const res: LambdaResponse = {
    status: (statusCode: number) => ({
      json: (responseBody: any) => {
        const response: APIGatewayProxyResult = {
          statusCode,
          body: JSON.stringify(responseBody),
          headers: {
            'Content-Type': 'application/json',
          },
        };
        callback(null, response);
      },
    }),
  };

  api.handleRequest(req, req, res);
};