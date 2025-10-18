-- ============================================================
-- CRITICAL INDEXES OPTIMIZATION FOR EXTRATO_RECORDS
-- ============================================================
-- Run this to create essential indexes for faster queries
-- Estimated improvement: 50-80% faster queries with user_id filter
--
-- Usage:
--   docker compose exec -T db psql -U mcpuser -d extrato_db < optimize-indexes.sql
-- ============================================================

-- Start transaction
BEGIN;

-- 1. CRITICAL: Index on user_id (most filtered column)
-- This is ESSENTIAL since ALL queries filter by user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_id
ON extrato_records (user_id);
COMMENT ON INDEX idx_user_id IS 'Critical index for user filtering';

-- 2. Composite index: user_id + data (common query pattern)
-- For queries like: WHERE user_id = ? AND data BETWEEN ? AND ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_data
ON extrato_records (user_id, data DESC);
COMMENT ON INDEX idx_user_data IS 'Composite index for user + date queries';

-- 3. Composite index: user_id + valor (for sum/aggregation queries)
-- For queries like: WHERE user_id = ? AND valor < 0
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_valor
ON extrato_records (user_id, valor);
COMMENT ON INDEX idx_user_valor IS 'Composite index for user + amount queries';

-- 4. Partial index: Only negative values (expenses)
-- Optimized for "quanto gastei?" queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_expenses
ON extrato_records (user_id, data DESC, valor)
WHERE valor < 0;
COMMENT ON INDEX idx_user_expenses IS 'Partial index for expense queries';

-- 5. Text search index: user_id + descricao (for ILIKE searches)
-- For queries like: WHERE user_id = ? AND descricao ILIKE '%ifood%'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_descricao_trgm
ON extrato_records USING gin (user_id, lower(descricao) gin_trgm_ops);
COMMENT ON INDEX idx_user_descricao_trgm IS 'GIN index for user + text search';

-- 6. Composite index: user_id + tipo_operacao
-- For queries filtering by operation type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_tipo
ON extrato_records (user_id, tipo_operacao);
COMMENT ON INDEX idx_user_tipo IS 'Composite index for user + operation type';

-- 7. Expression index: Month extraction for monthly reports
-- For queries like: WHERE user_id = ? AND EXTRACT(MONTH FROM data) = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_data_month
ON extrato_records (user_id, EXTRACT(MONTH FROM data), EXTRACT(YEAR FROM data));
COMMENT ON INDEX idx_user_data_month IS 'Expression index for monthly aggregations';

-- Analyze table to update statistics
ANALYZE extrato_records;

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Show all indexes on extrato_records
SELECT
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE tablename = 'extrato_records'
ORDER BY indexname;

-- Show index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'extrato_records'
ORDER BY idx_scan DESC;

-- ============================================================
-- PERFORMANCE TESTING
-- ============================================================

-- Test query performance (replace with actual user_id)
EXPLAIN ANALYZE
SELECT SUM(valor)
FROM extrato_records
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND valor < 0;

-- Test text search performance
EXPLAIN ANALYZE
SELECT *
FROM extrato_records
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND LOWER(descricao) ILIKE '%ifood%';

-- ============================================================
-- NOTES
-- ============================================================
--
-- CONCURRENTLY: Creates indexes without locking the table
-- GIN index: Requires pg_trgm extension for text search
-- Partial indexes: Smaller and faster for specific conditions
--
-- After creating indexes:
-- 1. Monitor query performance
-- 2. Check index usage with pg_stat_user_indexes
-- 3. Drop unused indexes to save space
-- 4. Run ANALYZE periodically to update statistics
--
-- ============================================================
