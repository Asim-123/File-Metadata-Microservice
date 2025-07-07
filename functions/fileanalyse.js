const busboy = require('busboy');

exports.handler = (event, context, callback) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
      },
      body: ''
    });
  }

  // Check if it's a POST request
  if (event.httpMethod !== 'POST') {
    return callback(null, {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    });
  }

  // Parse multipart form data
  const bb = busboy({ headers: event.headers });
  let fileInfo = null;

  bb.on('file', (fieldname, file, info) => {
    let size = 0;
    file.on('data', (data) => {
      size += data.length;
    });
    file.on('end', () => {
      fileInfo = {
        name: info.filename,
        type: info.mimeType,
        size: size
      };
    });
  });

  bb.on('finish', () => {
    if (!fileInfo) {
      callback(null, {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'No file uploaded' })
      });
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(fileInfo)
      });
    }
  });

  bb.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
}; 