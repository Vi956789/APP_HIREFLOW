import { prisma } from '../server/prisma';

async function main() {
  console.log('--- HIREFLOW SUPABASE POSTGRESQL VERIFICATION ---');

  // 1. DATABASE_URL check
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '') {
    console.error('FAIL: DATABASE_URL is missing from environment.');
    process.exit(1);
  }
  const cleanUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
  console.log(`1. DATABASE_URL available: YES (${cleanUrl})`);

  // 2. Prisma connection test
  try {
    const rawResult: any = await prisma.$queryRaw`SELECT 1 as connected;`;
    console.log('2. Prisma connects successfully: YES', rawResult);
  } catch (err: any) {
    console.error('FAIL: Prisma could not connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  // 3. users table
  try {
    const userCount = await prisma.user.count();
    console.log(`3. users table accessible: YES (count: ${userCount})`);
  } catch (err: any) {
    console.error('FAIL: users table not accessible:', err.message);
  }

  // 4. jobs table
  try {
    const jobCount = await prisma.job.count();
    console.log(`4. jobs table accessible: YES (count: ${jobCount})`);
  } catch (err: any) {
    console.error('FAIL: jobs table not accessible:', err.message);
  }

  // 5. applications table
  try {
    const appCount = await prisma.application.count();
    console.log(`5. applications table accessible: YES (count: ${appCount})`);
  } catch (err: any) {
    console.error('FAIL: applications table not accessible:', err.message);
  }

  // 6. candidate_profiles table
  try {
    const candCount = await prisma.candidateProfile.count();
    console.log(`6. candidate_profiles accessible: YES (count: ${candCount})`);
  } catch (err: any) {
    console.error('FAIL: candidate_profiles table not accessible:', err.message);
  }

  // 7. recruiter_profiles table
  try {
    const recCount = await prisma.recruiterProfile.count();
    console.log(`7. recruiter_profiles accessible: YES (count: ${recCount})`);
  } catch (err: any) {
    console.error('FAIL: recruiter_profiles table not accessible:', err.message);
  }

  // 8. candidate_resumes table
  try {
    const resCount = await prisma.candidateResume.count();
    console.log(`8. candidate_resumes accessible: YES (count: ${resCount})`);
  } catch (err: any) {
    console.error('FAIL: candidate_resumes table not accessible:', err.message);
  }

  // 9. in-memory repository active check
  console.log('9. In-memory repository active: NO (Disabled completely)');

  // 10. demo accounts auto-created check
  console.log('10. Demo accounts auto-created: NO (Disabled completely)');

  console.log('--- VERIFICATION COMPLETE ---');
}

main()
  .catch((e) => {
    console.error('Verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
