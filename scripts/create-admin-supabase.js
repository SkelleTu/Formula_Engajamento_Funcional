import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function createAdmin() {
  try {
    console.log('\n=== Criar Administrador no Supabase ===\n');
    
    const username = await question('Nome de usuário: ');
    const password = await question('Senha: ');

    if (!username || !password) {
      console.error('Erro: Nome de usuário e senha são obrigatórios');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Erro: A senha deve ter pelo menos 6 caracteres');
      process.exit(1);
    }

    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      console.error('Erro: Este nome de usuário já existe');
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('admins')
      .insert({
        username,
        password_hash: passwordHash,
        requires_password_change: false
      });

    if (error) {
      console.error('Erro ao criar admin:', error.message);
      process.exit(1);
    }

    console.log(`\nAdmin "${username}" criado com sucesso!`);
    console.log('Você pode fazer login no painel administrativo agora.');
    
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
