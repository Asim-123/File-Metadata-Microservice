# File Metadata Microservice

This is a full stack JavaScript app that allows users to upload a file and receive its metadata (name, type, and size in bytes) as a JSON response.

## Features
- Upload a file using a form (input name: `upfile`)
- Receive file metadata in JSON format
- Built with Node.js, Express, and Multer
- Ready for deployment on Netlify

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Installation
```bash
npm install
```

### Running Locally
```bash
npm start
```

### Deploying to Netlify
- Ensure you have a `netlify.toml` file in the root directory (see below).
- Set the build command to `npm run build` (if needed) and the publish directory to `dist` or as appropriate.
- Set up a serverless function for the API endpoint if using Netlify Functions.

## Netlify Functions Deployment
- Place your serverless function in the `functions/` directory (e.g., `functions/fileanalyse.js`).
- Netlify will automatically deploy this as a serverless function.
- The frontend (index.html) will POST to `/api/fileanalyse`, which is redirected to the function.
- For local development, use Express (`server.js`). For Netlify, use the serverless function.

## API Endpoint
- **POST** `/api/fileanalyse`
  - Form field: `upfile` (type: file)
  - Response: `{ name, type, size }`

## Example Response
```json
{
  "name": "example.txt",
  "type": "text/plain",
  "size": 1234
}
``` 