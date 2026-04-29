import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get database schema
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const database = 'cfms';

    // Get all tables
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [database]);

    // For each table, get columns and foreign keys
    const schema = await Promise.all(
      tables.map(async (tableRow) => {
        const tableName = tableRow.TABLE_NAME;

        // Get columns
        const [columns] = await pool.execute(`
          SELECT 
            COLUMN_NAME,
            COLUMN_TYPE,
            IS_NULLABLE,
            COLUMN_KEY,
            EXTRA,
            COLUMN_DEFAULT
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [database, tableName]);

        // Get foreign keys
        const [foreignKeys] = await pool.execute(`
          SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [database, tableName]);

        // Get primary key
        const [primaryKey] = await pool.execute(`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
        `, [database, tableName]);

        return {
          name: tableName,
          columns: columns.map(col => ({
            name: col.COLUMN_NAME,
            type: col.COLUMN_TYPE,
            nullable: col.IS_NULLABLE === 'YES',
            isPrimary: col.COLUMN_KEY === 'PRI',
            isUnique: col.COLUMN_KEY === 'UNI',
            isIndex: col.COLUMN_KEY === 'MUL',
            extra: col.EXTRA,
            default: col.COLUMN_DEFAULT
          })),
          foreignKeys: foreignKeys.map(fk => ({
            constraintName: fk.CONSTRAINT_NAME,
            column: fk.COLUMN_NAME,
            referencedTable: fk.REFERENCED_TABLE_NAME,
            referencedColumn: fk.REFERENCED_COLUMN_NAME
          })),
          primaryKey: primaryKey.map(pk => pk.COLUMN_NAME)
        };
      })
    );

    res.json({
      database,
      tables: schema
    });

  } catch (error) {
    next(error);
  }
});

export default router;
