import { execSync } from 'child_process';

const run = (cmd: string) => {
  console.log(`▶ Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

try {
  // Safe for production and Kubernetes — applies existing migrations only
  run('npx prisma migrate deploy');

  // Seed scripts (adjust or reorder as needed)
  run('npx ts-node prisma/seed_paiment.ts');
  run('npx ts-node prisma/seed.ts');
  run('npx ts-node prisma/seed_documents.ts');
  run('npx ts-node prisma/seed_communs.ts');
  run('npx ts-node prisma/seed_substances.ts');
  run('npx ts-node prisma/seed_statutpermis.ts');

  console.log('✅ All seeds executed successfully!');
} catch (e) {
  console.error('❌ Error while running seeds', e);
  process.exit(1);
}
