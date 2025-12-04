import Database from 'better-sqlite3';

const db = new Database('./database.db');

try {
  // Adicionar campo requires_password_change
  db.exec(`
    ALTER TABLE admins ADD COLUMN requires_password_change INTEGER DEFAULT 0;
  `);
  console.log('✅ Campo requires_password_change adicionado com sucesso!');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️  Campo requires_password_change já existe');
  } else {
    console.error('❌ Erro:', error);
  }
}

// Marcar Julio como necessitando trocar senha
db.prepare('UPDATE admins SET requires_password_change = 1 WHERE username = ?').run('Julio');
console.log('✅ Julio marcado para trocar senha no primeiro acesso');

db.close();
