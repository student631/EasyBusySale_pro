/**
 * Database Migration Runner
 * Runs SQL migration files from the migrations directory
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);

  log(`\n${'='.repeat(70)}`, colors.cyan);
  log(`Running migration: ${migrationFile}`, colors.bright);
  log('='.repeat(70), colors.cyan);

  try {
    // Read the migration file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    log(`\n📄 Migration file loaded (${sql.length} characters)`, colors.blue);

    // Execute the migration
    log('\n🚀 Executing migration...', colors.yellow);
    const result = await pool.query(sql);

    // Log results
    log('\n✅ Migration completed successfully!', colors.green);

    // If the migration returns results, display them
    if (result.rows && result.rows.length > 0) {
      log('\n📊 Migration Results:', colors.cyan);
      console.table(result.rows);
    }

    return true;
  } catch (error) {
    log('\n❌ Migration failed!', colors.red);
    log(`Error: ${error.message}`, colors.red);
    if (error.detail) {
      log(`Detail: ${error.detail}`, colors.red);
    }
    if (error.hint) {
      log(`Hint: ${error.hint}`, colors.yellow);
    }
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const migrationFile = args[0] || '001-add-location-and-category-fields.sql';

  log('\n🗄️  Database Migration Tool', colors.bright);
  log(`Database: ${pool.options.database || 'olx_database'}`, colors.blue);
  log(`Migration: ${migrationFile}`, colors.blue);

  try {
    // Test database connection
    log('\n🔌 Testing database connection...', colors.yellow);
    await pool.query('SELECT NOW()');
    log('✅ Database connection successful', colors.green);

    // Run migration
    const success = await runMigration(migrationFile);

    if (success) {
      log('\n' + '='.repeat(70), colors.green);
      log('✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY', colors.green);
      log('='.repeat(70), colors.green);
      process.exit(0);
    } else {
      log('\n' + '='.repeat(70), colors.red);
      log('❌ MIGRATION FAILED', colors.red);
      log('='.repeat(70), colors.red);
      process.exit(1);
    }
  } catch (error) {
    log('\n❌ Fatal error:', colors.red);
    log(error.message, colors.red);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log('\n❌ Unhandled error:', colors.red);
  console.error(error);
  process.exit(1);
});

// Run the migration
main();
