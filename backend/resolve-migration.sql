-- Mark the failed migration as resolved
UPDATE "_prisma_migrations" 
SET finished_at = started_at + interval '1 second',
    applied_steps_count = 1,
    logs = 'Manually resolved - migration was partially applied'
WHERE migration_name = '20251022094130_add_crypto_balances_to_users'
  AND finished_at IS NULL;
