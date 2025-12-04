import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./database.db');

console.log('='.repeat(60));
console.log('TESTE DE CREDENCIAIS DO SISTEMA DE LOGIN');
console.log('='.repeat(60));
console.log('');

const admins = db.prepare('SELECT username, requires_password_change, created_at FROM admins').all();

console.log('✅ Usuários encontrados no banco de dados:');
console.log('');
admins.forEach((admin, index) => {
  console.log(`${index + 1}. Usuário: ${admin.username}`);
  console.log(`   Criado em: ${admin.created_at}`);
  console.log(`   Requer troca de senha: ${admin.requires_password_change === 1 ? 'Sim' : 'Não'}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('TESTANDO CREDENCIAIS FORNECIDAS:');
console.log('='.repeat(60));
console.log('');

if (process.argv.length > 2) {
  const testUsername = process.argv[2];
  const testPassword = process.argv[3];
  
  if (!testUsername || !testPassword) {
    console.log('💡 Uso: node scripts/test-login.js <username> <senha>');
    console.log('');
  } else {
    console.log(`Testando credenciais fornecidas...`);
    console.log('');
    
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(testUsername);
    
    if (!admin) {
      console.log(`❌ ERRO: Usuário "${testUsername}" NÃO encontrado no banco de dados`);
      console.log('');
    } else {
      const isValid = await bcrypt.compare(testPassword, admin.password_hash);
      
      if (isValid) {
        console.log(`✅ SUCESSO: Credenciais válidas!`);
        console.log(`👤 Usuário: ${testUsername}`);
      } else {
        console.log(`❌ ERRO: Senha incorreta para o usuário "${testUsername}"`);
      }
      console.log('');
    }
  }
}

console.log('='.repeat(60));
console.log('PROBLEMAS IDENTIFICADOS:');
console.log('='.repeat(60));
console.log('');
console.log('1. O usuário correto é "JULIAOCALORI" (com IA), não "JULIOCALORI"');
console.log('   Certifique-se de digitar o nome de usuário exatamente como está');
console.log('');
console.log('2. As senhas são case-sensitive (maiúsculas e minúsculas importam)');
console.log('');
console.log('3. O erro "erro ao conectar com o servidor" pode ocorrer se:');
console.log('   - O nome de usuário estiver incorreto');
console.log('   - A senha estiver incorreta');
console.log('   - Houver problema de rede (improvável, pois o servidor está funcionando)');
console.log('');
console.log('='.repeat(60));

db.close();
