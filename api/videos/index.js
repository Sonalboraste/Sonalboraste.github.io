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
    rowCollectionOnRequestCompletion: true
  }
};

module.exports = async function (context, req) {
  return new Promise((resolve) => {
    const connection = new Connection(config);

    connection.on('connect', (err) => {
      if (err) {
        context.res = { status: 500, body: "Connection error: " + err.message };
        resolve();
        return;
      }

      const sqlRequest = new Request(
        "SELECT Category, Title, YouTubeId, SortOrder FROM Videos ORDER BY Category, SortOrder",
        (err, rowCount, rows) => {
          if (err) {
            context.res = { status: 500, body: "Query error: " + err.message };
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
  });
};