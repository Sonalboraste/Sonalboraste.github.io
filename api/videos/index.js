const sql = require('mssql');

const config = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: true
  }
};

module.exports = async function (context, req) {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT Category, Title, YouTubeId, SortOrder FROM Videos ORDER BY Category, SortOrder`;
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: result.recordset
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: "Error: " + err.message
    };
  } finally {
    await sql.close();
  }
};