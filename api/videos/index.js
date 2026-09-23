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

module.exports = async function (context, req) {
  return new Promise((resolve) => {
    try {
      const connection = new Connection(config);

      connection.on('connect', (err) => {
        if (err) {
          context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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

            context.res = {
              status: 200,
              headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: { error: "Unhandled exception", message: outerErr.message }
      };
      resolve();
    }
  });
};