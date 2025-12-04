import Database from 'better-sqlite3';

const db = new Database('database.db');

console.log('\n🗑️  LIMPANDO BANCO DE DADOS DE ANALYTICS...\n');

// Mostrar resumo antes
const visitorsCount = db.prepare('SELECT COUNT(*) as total FROM visitors').get();
const registrationsCount = db.prepare('SELECT COUNT(*) as total FROM registrations').get();
const eventsCount = db.prepare('SELECT COUNT(*) as total FROM events').get();
const pageViewsCount = db.prepare('SELECT COUNT(*) as total FROM page_views').get();

console.log('📊 Dados que serão DELETADOS:');
console.log(`   - ${visitorsCount.total} visitantes`);
console.log(`   - ${registrationsCount.total} cadastros`);
console.log(`   - ${eventsCount.total} eventos`);
console.log(`   - ${pageViewsCount.total} visualizações de página\n`);

try {
  // Deletar na ordem correta (respeitando foreign keys)
  db.prepare('DELETE FROM page_views').run();
  console.log('✓ Visualizações de página deletadas');
  
  db.prepare('DELETE FROM events').run();
  console.log('✓ Eventos deletados');
  
  db.prepare('DELETE FROM registrations').run();
  console.log('✓ Cadastros deletados');
  
  db.prepare('DELETE FROM visitors').run();
  console.log('✓ Visitantes deletados');
  
  // Resetar auto-increment IDs
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('visitors', 'registrations', 'events', 'page_views')").run();
  console.log('✓ IDs resetados\n');
  
  // Verificar se está limpo
  const finalVisitors = db.prepare('SELECT COUNT(*) as total FROM visitors').get();
  const finalRegistrations = db.prepare('SELECT COUNT(*) as total FROM registrations').get();
  const finalEvents = db.prepare('SELECT COUNT(*) as total FROM events').get();
  const finalPageViews = db.prepare('SELECT COUNT(*) as total FROM page_views').get();
  
  console.log('✅ BANCO LIMPO COM SUCESSO!\n');
  console.log('📊 Dados restantes:');
  console.log(`   - ${finalVisitors.total} visitantes`);
  console.log(`   - ${finalRegistrations.total} cadastros`);
  console.log(`   - ${finalEvents.total} eventos`);
  console.log(`   - ${finalPageViews.total} visualizações de página\n`);
  
  // Verificar dados preservados
  const adminsCount = db.prepare('SELECT COUNT(*) as total FROM admins').get();
  const videoConfigCount = db.prepare('SELECT COUNT(*) as total FROM video_config').get();
  
  console.log('✅ Dados preservados (não deletados):');
  console.log(`   - ${adminsCount.total} admins (Victor e Julio)`);
  console.log(`   - ${videoConfigCount.total} configurações de vídeo\n`);
  
  console.log('🎉 Pronto! Banco de dados 100% limpo de dados falsos.\n');
  
} catch (error) {
  console.error('\n❌ Erro ao limpar banco:', error.message);
  process.exit(1);
}

db.close();
