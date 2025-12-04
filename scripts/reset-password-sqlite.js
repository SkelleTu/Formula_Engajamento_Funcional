import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
  console.error('❌ Uso: node scripts/reset-password-sqlite.js <username> <nova_senha>');
  process.exit(1);
}

const db = new Database('./database.db');

try {
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  
  if (!admin) {
    console.log(`❌ Usuário "${username}" não encontrado no banco de dados`);
    console.log('');
    console.log('Usuários disponíveis:');
    const allAdmins = db.prepare('SELECT username FROM admins').all();
    allAdmins.forEach(a => console.log(`  - ${a.username}`));
    db.close();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  db.prepare('UPDATE admins SET password_hash = ?, requires_password_change = 0 WHERE username = ?')
    .run(hashedPassword, username);

  console.log('✅ Senha resetada com sucesso!');
  console.log(`👤 Usuário: ${username}`);
  console.log('🔐 Nova senha: [protegida]');
  console.log('');
  console.log('🔗 Acesse o painel admin em: /admin/login');
  
  db.close();
} catch (error) {
  console.error('❌ Erro ao resetar senha:', error);
  db.close();
  process.exit(1);
}
