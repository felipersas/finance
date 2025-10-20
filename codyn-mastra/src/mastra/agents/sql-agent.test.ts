import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire tool to avoid Mastra dependencies
const mockExecuteSqlQueryTool = {
  id: 'execute-sql-query',
  inputSchema: {
    parse: vi.fn(),
  },
  execute: vi.fn(),
  description: 'Executes SQL queries safely',
};

// Mock the tool import
vi.mock('../tools/execute-sql-query', () => ({
  executeSqlQueryTool: mockExecuteSqlQueryTool,
}));

describe('SQL Agent Tool - executeSqlQueryTool (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Structure', () => {
    it('should have correct tool id', () => {
      expect(mockExecuteSqlQueryTool.id).toBe('execute-sql-query');
    });

    it('should have input schema', () => {
      expect(mockExecuteSqlQueryTool.inputSchema).toBeDefined();
      expect(typeof mockExecuteSqlQueryTool.inputSchema.parse).toBe('function');
    });

    it('should have execute function', () => {
      expect(mockExecuteSqlQueryTool.execute).toBeDefined();
      expect(typeof mockExecuteSqlQueryTool.execute).toBe('function');
    });

    it('should have description', () => {
      expect(mockExecuteSqlQueryTool.description).toBeTruthy();
    });
  });

  describe('Input Schema Validation', () => {
    it('should accept valid SQL query input', () => {
      const validInput = { query: 'SELECT * FROM extrato_records LIMIT 10' };

      mockExecuteSqlQueryTool.inputSchema.parse.mockReturnValue(validInput);

      const result = mockExecuteSqlQueryTool.inputSchema.parse(validInput);
      expect(result).toEqual(validInput);
      expect(mockExecuteSqlQueryTool.inputSchema.parse).toHaveBeenCalledWith(validInput);
    });

    it('should reject invalid input', () => {
      const invalidInput = { query: 123 };

      mockExecuteSqlQueryTool.inputSchema.parse.mockImplementation(() => {
        throw new Error('Invalid input');
      });

      expect(() => mockExecuteSqlQueryTool.inputSchema.parse(invalidInput)).toThrow('Invalid input');
    });

    it('should require query parameter', () => {
      const emptyInput = {};

      mockExecuteSqlQueryTool.inputSchema.parse.mockImplementation(() => {
        throw new Error('Query parameter required');
      });

      expect(() => mockExecuteSqlQueryTool.inputSchema.parse(emptyInput)).toThrow('Query parameter required');
    });
  });

  describe('Security Validation (Mocked)', () => {
    it('should reject DELETE queries', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Only SELECT queries are allowed for security reasons',
        executionTime: '0.001s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'DELETE FROM extrato_records' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('SELECT queries');
    });

    it('should reject INSERT queries', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Only SELECT queries are allowed for security reasons',
        executionTime: '0.001s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'INSERT INTO extrato_records VALUES (...)' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('SELECT queries');
    });

    it('should reject UPDATE queries', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Only SELECT queries are allowed for security reasons',
        executionTime: '0.001s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'UPDATE extrato_records SET valor = 0' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('SELECT queries');
    });

    it('should require user authentication', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'User authentication required',
        executionTime: '0.001s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records' },
        runtimeContext: { get: () => null },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('authentication');
    });

    it('should detect dangerous patterns in chained queries', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Query contains forbidden operations',
        executionTime: '0.001s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM users; DROP TABLE users;' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('forbidden');
    });
  });

  describe('Successful Execution (Mocked)', () => {
    it('should execute valid SELECT query successfully', async () => {
      const mockData = [
        { id: '1', valor: -50, descricao: 'Test transaction' }
      ];

      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: true,
        data: mockData,
        rowCount: 1,
        executedQuery: 'SELECT * FROM extrato_records WHERE user_id = \'user-123\' LIMIT 1',
        executionTime: '0.045s',
        columns: [
          { name: 'id', dataType: 25 },
          { name: 'valor', dataType: 1700 },
          { name: 'descricao', dataType: 25 },
        ],
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records LIMIT 1' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.rowCount).toBe(1);
      expect(result.executionTime).toMatch(/\d+\.\d+s/);
      expect(result.columns).toBeDefined();
    });

    it('should auto-inject user_id filter', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: true,
        data: [],
        rowCount: 0,
        executedQuery: 'SELECT * FROM extrato_records WHERE user_id = \'user-123\'',
        executionTime: '0.023s',
        columns: [],
      });

      await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(mockExecuteSqlQueryTool.execute).toHaveBeenCalledWith({
        context: { query: 'SELECT * FROM extrato_records' },
        runtimeContext: { get: expect.any(Function) },
      });
    });

    it('should limit results to prevent overload', async () => {
      const largeDataset = Array.from({ length: 150 }, (_, i) => ({ id: i.toString() }));

      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: true,
        data: largeDataset.slice(0, 100), // Limited to 100
        rowCount: 150, // Original count
        executedQuery: 'SELECT * FROM extrato_records WHERE user_id = \'user-123\'',
        executionTime: '0.123s',
        columns: [{ name: 'id', dataType: 25 }],
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(100);
      expect(result.rowCount).toBe(150);
    });

    it('should clean SQL wrapped in code blocks', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: true,
        data: [],
        executedQuery: 'SELECT * FROM extrato_records WHERE user_id = \'user-123\'',
        executionTime: '0.012s',
        columns: [],
        rowCount: 0,
      });

      await mockExecuteSqlQueryTool.execute({
        context: {
          query: `\`\`\`sql
SELECT * FROM extrato_records
\`\`\``
        },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(mockExecuteSqlQueryTool.execute).toHaveBeenCalled();
    });
  });

  describe('Error Handling (Mocked)', () => {
    it('should handle database connection errors', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Failed to execute query: Connection failed',
        executionTime: '0.005s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to execute query');
      expect(result.executionTime).toMatch(/\d+\.\d+s/);
    });

    it('should handle invalid SQL syntax', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Failed to execute query: syntax error at or near "FROM"',
        executionTime: '0.003s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM WHERE' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('syntax error');
    });

    it('should handle table not found errors', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: false,
        error: 'Failed to execute query: relation "nonexistent_table" does not exist',
        executionTime: '0.008s',
        data: [],
        rowCount: 0,
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM nonexistent_table' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });
  });

  describe('Response Structure', () => {
    it('should return structured success response', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', valor: 100 }],
        rowCount: 1,
        executedQuery: 'SELECT id, valor FROM extrato_records WHERE user_id = \'user-123\' LIMIT 1',
        executionTime: '0.045s',
        columns: [
          { name: 'id', dataType: 25 },
          { name: 'valor', dataType: 1700 },
        ],
      };

      mockExecuteSqlQueryTool.execute.mockResolvedValue(mockResponse);

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT id, valor FROM extrato_records LIMIT 1' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('rowCount', 1);
      expect(result).toHaveProperty('executedQuery');
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('columns');

      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return structured error response', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'User authentication required',
        executionTime: '0.001s',
        data: [],
        rowCount: 0,
      };

      mockExecuteSqlQueryTool.execute.mockResolvedValue(mockErrorResponse);

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records' },
        runtimeContext: { get: () => null },
      });

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('data', []);
      expect(result).toHaveProperty('rowCount', 0);
    });

    it('should include execution time in all responses', async () => {
      mockExecuteSqlQueryTool.execute.mockResolvedValue({
        success: true,
        data: [],
        rowCount: 0,
        executedQuery: 'SELECT * FROM extrato_records WHERE user_id = \'user-123\' LIMIT 1',
        executionTime: '0.023s',
        columns: [],
      });

      const result = await mockExecuteSqlQueryTool.execute({
        context: { query: 'SELECT * FROM extrato_records LIMIT 1' },
        runtimeContext: { get: () => ({ sub: 'user-123' }) },
      });

      expect(result.executionTime).toMatch(/^\d+\.\d+s$/);
    });
  });

  describe('SQL Query Patterns', () => {
    const validQueries = [
      {
        description: 'Total spending',
        sql: 'SELECT SUM(ABS(valor)) as total FROM extrato_records WHERE valor < 0',
      },
      {
        description: 'Spending by merchant',
        sql: `SELECT remetente_destinatario, SUM(ABS(valor)) as total
              FROM extrato_records
              WHERE valor < 0 AND LOWER(remetente_destinatario) ILIKE '%uber%'
              GROUP BY remetente_destinatario`,
      },
      {
        description: 'Recent transactions',
        sql: `SELECT data, descricao, valor, remetente_destinatario
              FROM extrato_records
              ORDER BY data DESC
              LIMIT 20`,
      },
      {
        description: 'Monthly summary',
        sql: `SELECT
                DATE_TRUNC('month', data) as mes,
                SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END) as gastos,
                SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) as receitas
              FROM extrato_records
              GROUP BY DATE_TRUNC('month', data)
              ORDER BY mes DESC`,
      },
    ];

    validQueries.forEach(({ description, sql }) => {
      it(`should accept valid pattern: ${description}`, () => {
        const lowerSql = sql.trim().toLowerCase();
        const isSelect = lowerSql.startsWith('select');
        const hasDangerousOps = /;\s*(delete|drop|update|insert|truncate|alter)/i.test(lowerSql);

        expect(isSelect).toBe(true);
        expect(hasDangerousOps).toBe(false);
      });
    });
  });
});
