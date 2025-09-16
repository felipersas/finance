import { MySQLService } from "../../infrastructure/database/MySQLService.js";

export class ExtratoService {
  constructor(
    private dbService?: MySQLService,
  ) {
    console.error("ExtratoService constructor - dbService is:", this.dbService ? "defined" : "undefined");
  }


  async executeCustomExtratoQuery(query: string): Promise<string> {
    if (!this.dbService) {
      return "Database service is not available. Please enable database integration.";
    }

    try {
      // Execute the custom query
      const results = await this.dbService.executeCustomQuery(query);

      if (results.length === 0) {
        return "No results found";
      }

      // Format results as a readable table
      const headers = Object.keys(results[0]);
      const headerRow = headers.join(' | ');
      const separatorRow = headers.map(() => '---').join(' | ');
      const dataRows = results.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value instanceof Date) {
            return value.toLocaleString();
          }
          return value !== null && value !== undefined ? String(value) : 'NULL';
        }).join(' | ')
      );

      const table = [headerRow, separatorRow, ...dataRows].join('\n');

      // Return only the table results
      console.log("table", table);
      return table;

    } catch (error) {
      return `Error executing query: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async getDatabaseSchema(): Promise<string> {
    if (!this.dbService) {
      return "Database service is not available. Please enable database integration.";
    }

    try {
      const schemaInfo = await this.dbService.getTableSchema();
      return schemaInfo;
    } catch (error) {
      return `Error retrieving database schema: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}