const multer = require('multer');
const upload = multer();

exports.handler = (event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    return callback(null, {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    });
  }

  // Netlify Functions do not natively support multipart/form-data, so we need to parse it manually
  const busboy = require('busboy');
  const bb = busboy({ headers: event.headers });
  let fileInfo = null;

  return new Promise((resolve, reject) => {
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
        resolve({
          statusCode: 400,
          body: JSON.stringify({ error: 'No file uploaded' })
        });
      } else {
        resolve({
          statusCode: 200,
          body: JSON.stringify(fileInfo)
        });
      }
    });
    bb.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
  });
}; 