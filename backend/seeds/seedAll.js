import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runSeed = async (file, description) => {
  console.log(`\n🌱 Ejecutando: ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(`node seeds/${file}`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${file}:`, error.message);
    return false;
  }
};

const seedAll = async () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🌱 GAMMA Service - Seed Completo    ║');
  console.log('╚════════════════════════════════════════╝\n');

  const seeds = [
    { file: 'seedVehicles.js', description: 'Vehículos e Inventario (50 registros)' },
    { file: 'seedClients.js', description: 'Clientes (100 registros)' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const seed of seeds) {
    const success = await runSeed(seed.file, seed.description);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║         📊 Resumen Final              ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`✅ Seeds exitosos: ${successCount}`);
  console.log(`❌ Seeds fallidos: ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 ¡Seed completo exitoso!');
    console.log('\n📝 Datos creados:');
    console.log('   - 50 vehículos con inventario');
    console.log('   - 100 clientes');
    console.log('\n🚀 Ahora puedes iniciar el backend:');
    console.log('   cd backend && npm run dev');
  } else {
    console.log('\n⚠️  Algunos seeds fallaron. Revisa los errores arriba.');
  }
};

seedAll();
