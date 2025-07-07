const busboy = require('busboy');

exports.handler = (event, context, callback) => {
  console.log('Function called with method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Credentials': 'true'
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
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    });
  }

  // Check if we have a body
  if (!event.body) {
    return callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      },
      body: JSON.stringify({ error: 'No request body' })
    });
  }

  // Parse multipart form data
  const bb = busboy({ 
    headers: event.headers,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });
  let fileInfo = null;

  bb.on('file', (fieldname, file, info) => {
    console.log('File field received:', fieldname);
    console.log('File info:', JSON.stringify(info));
    
    // Only process the 'upfile' field
    if (fieldname === 'upfile') {
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
        console.log('File processed:', JSON.stringify(fileInfo));
      });
    } else {
      console.log('Skipping field:', fieldname);
      // Skip other fields
      file.resume();
    }
  });

  bb.on('finish', () => {
    console.log('Busboy finished, fileInfo:', fileInfo);
    if (!fileInfo) {
      callback(null, {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        },
        body: JSON.stringify({ error: 'No file uploaded or invalid field name' })
      });
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        },
        body: JSON.stringify(fileInfo)
      });
    }
  });

  bb.on('error', (err) => {
    console.error('Busboy error:', err);
    callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      },
      body: JSON.stringify({ error: 'Error parsing file upload: ' + err.message })
    });
  });

  try {
    bb.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
  } catch (err) {
    console.error('Error ending busboy:', err);
    callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      },
      body: JSON.stringify({ error: 'Error processing request: ' + err.message })
    });
  }
}; 