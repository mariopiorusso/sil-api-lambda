export const success = (data: any) => ({
    statusCode: 200,
    body: JSON.stringify(data),
});

export const error = (err: any) => ({
    statusCode: err.statusCode || 501,
    body: JSON.stringify({ message: err.message }),
});