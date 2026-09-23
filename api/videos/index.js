const { Connection, Request, TYPES } = require('tedious');

const config = {
  server: process.env.SQL_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD
    }
  },
  options: {
    database: process.env.SQL_DATABASE,
    encrypt: true,
    rowCollectionOnRequestCompletion: true,
    connectTimeout: 30000
  }
};

const responseHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://sonalboraste.github.io"
};

const cacheDurationInSeconds = 300;
let cachedVideoList = null;
let cacheExpiresAtMilliseconds = 0;

const successResponseHeaders = {
  ...responseHeaders,
  "Cache-Control": "public, max-age=" + cacheDurationInSeconds
};

module.exports = async function (context, req) {
    if (cachedVideoList !== null && Date.now() < cacheExpiresAtMilliseconds) {
    context.res = {
      status: 200,
      headers: { ...successResponseHeaders, "X-Cache": "HIT" },
      body: cachedVideoList
    };
    return;
  }
  return new Promise((resolve) => {
    try {
      const connection = new Connection(config);

      connection.on('connect', (err) => {
        if (err) {
          context.res = {
            status: 500,
            headers: responseHeaders,
            body: {
              error: "Connection failed",
              message: err.message,
              env_check: {
                server: process.env.SQL_SERVER ? "set" : "MISSING",
                database: process.env.SQL_DATABASE ? "set" : "MISSING",
                user: process.env.SQL_USER ? "set" : "MISSING",
                password: process.env.SQL_PASSWORD ? "set" : "MISSING"
              }
            }
          };
          resolve();
          return;
        }

        const sqlRequest = new Request(
          "SELECT Category, Title, YouTubeId, SortOrder FROM Videos ORDER BY Category, SortOrder",
          (err, rowCount, rows) => {
            if (err) {
              context.res = {
                status: 500,
                headers: responseHeaders,
                body: { error: "Query failed", message: err.message }
              };
              connection.close();
              resolve();
              return;
            }

            const videos = rows.map(row => ({
              Category: row[0].value,
              Title: row[1].value,
              YouTubeId: row[2].value,
              SortOrder: row[3].value
            }));

            
            cachedVideoList = videos;
            cacheExpiresAtMilliseconds = Date.now() + cacheDurationInSeconds * 1000;

            context.res = {
              status: 200,
              headers: { ...successResponseHeaders, "X-Cache": "MISS" },
              body: videos
            };
            connection.close();
            resolve();
          }
        );

        connection.execSql(sqlRequest);
      });

      connection.connect();
    } catch (outerErr) {
      context.res = {
        status: 500,
        headers: responseHeaders,
        body: { error: "Unhandled exception", message: outerErr.message }
      };
      resolve();
    }
  });
};