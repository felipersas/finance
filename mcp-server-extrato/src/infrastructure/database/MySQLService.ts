import mysql from 'mysql2/promise';

export class MySQLService {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'mysql',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'rootpassword',
        database: process.env.DB_NAME || 'extrato_db',
        port: parseInt(process.env.DB_PORT || '3306')
      });

      await this.getTableSchema(); // Test the connection by fetching the schema
      console.log('Connected to MySQL database');
    } catch (error) {
      console.error('Failed to connect to MySQL:', error);
      throw error;
    }
  }

  async executeCustomQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.connection) throw new Error('No database connection');

    // Security: Only allow SELECT statements
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select') && !trimmedQuery.includes('show')) {
      throw new Error('Only SELECT queries are allowed for security reasons');
    }

    // Additional security: Block dangerous keywords
    const dangerousKeywords = ['drop', 'delete', 'insert', 'update', 'alter', 'create', 'truncate'];
    const queryLower = query.toLowerCase();

    for (const keyword of dangerousKeywords) {
      if (queryLower.includes(keyword.trim())) {
        throw new Error(`Query contains prohibited keyword: ${keyword}`);
      }
    }

    try {
      const [rows] = await this.connection.execute(query, params);
      console.log('Custom query executed:', query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error executing custom query:', error);
      throw error;
    }
  }

  async getTableSchema(): Promise<string> {
    if (!this.connection) throw new Error('No database connection');

    const [extratoRecordsSchema] = await this.connection.execute(`
      DESCRIBE extrato_records
    `);


    const extratoRecordsInfo = (extratoRecordsSchema as any[])
      .map(col => `  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`)
      .join('\n');

    return `Database Schema:

      extrato_records table:
      ${extratoRecordsInfo}

        `;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('Disconnected from MySQL database');
    }
  }
}
