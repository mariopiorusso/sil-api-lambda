export class HttpResponse {
    static ok(body: any) {
      return {
        statusCode: 200,
        body: JSON.stringify(body),
      };
    }
  
    static created(body: any) {
      return {
        statusCode: 201,
        body: JSON.stringify(body),
      };
    }
  
    static badRequest(body: any) {
      return {
        statusCode: 400,
        body: JSON.stringify(body),
      };
    }
  
    static notFound(body: any) {
      return {
        statusCode: 404,
        body: JSON.stringify(body),
      };
    }
  
    static noContent() {
      return {
        statusCode: 204,
        body: '',
      };
    }
  
    static internalServerError(body: any) {
      return {
        statusCode: 500,
        body: JSON.stringify(body),
      };
    }
  }
  