import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./database.db');

async function setupAdminUsers() {
  try {
    // Usuário Victor
    const victorPassword = 'Victor.!.1999';
    const victorHash = await bcrypt.hash(victorPassword, 10);
    
    // Verificar se Victor já existe
    const victorExists = db.prepare('SELECT * FROM admins WHERE username = ?').get('Victor');
    
    if (victorExists) {
      // Atualizar senha do Victor
      db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(victorHash, 'Victor');
      console.log('✅ Usuário Victor atualizado com sucesso!');
    } else {
      // Criar Victor
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('Victor', victorHash);
      console.log('✅ Usuário Victor criado com sucesso!');
    }
    
    console.log('👤 Username: Victor');
    console.log('🔐 Senha: Victor.!.1999');
    console.log('');
    
    // Usuário Julio - senha temporária que precisa ser definida
    const julioPassword = 'JulioTemp2024!';
    const julioHash = await bcrypt.hash(julioPassword, 10);
    
    // Verificar se Julio já existe
    const julioExists = db.prepare('SELECT * FROM admins WHERE username = ?').get('Julio');
    
    if (julioExists) {
      // Atualizar senha do Julio
      db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(julioHash, 'Julio');
      console.log('✅ Usuário Julio atualizado com sucesso!');
    } else {
      // Criar Julio
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('Julio', julioHash);
      console.log('✅ Usuário Julio criado com sucesso!');
    }
    
    console.log('👤 Username: Julio');
    console.log('🔐 Senha temporária: JulioTemp2024!');
    console.log('⚠️  Julio deve alterar sua senha no primeiro acesso');
    console.log('');
    console.log('🔗 Acesse o painel admin em: /admin');
    
    db.close();
  } catch (error) {
    console.error('❌ Erro ao criar usuários admin:', error);
    process.exit(1);
  }
}

setupAdminUsers();
