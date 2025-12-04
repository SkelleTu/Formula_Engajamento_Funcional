import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('./database.db');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('❌ Uso: node scripts/create-admin-sqlite.js <username> <senha>');
  process.exit(1);
}

async function createAdmin() {
  try {
    const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    
    if (existing) {
      console.log('⚠️  Admin com este username já existe');
      
      const response = await new Promise((resolve) => {
        process.stdout.write('Deseja atualizar a senha? (s/n): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });
      
      if (response !== 's' && response !== 'sim') {
        console.log('❌ Operação cancelada');
        process.exit(0);
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hashedPassword, username);
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hashedPassword);
      console.log('✅ Admin criado com sucesso!');
    }

    console.log(`👤 Username: ${username}`);
    console.log('🔐 Senha: [protegida]');
    console.log('\n🔗 Acesse o painel admin em: /admin');
    
    db.close();
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar admin:', error);
    db.close();
    process.exit(1);
  }
}

createAdmin();
