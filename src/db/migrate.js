const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

const runMigrations = async () => {
  console.log('Running database migrations...');
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Executing migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    await query(sql);
  }

  console.log('Database migrations completed successfully.');
};

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = runMigrations;
