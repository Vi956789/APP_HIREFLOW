import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Supabase PostgreSQL database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Recruiter seed
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@nexusai.tech' },
    update: {},
    create: {
      name: 'Sarah Jenkins',
      email: 'recruiter@nexusai.tech',
      passwordHash,
      role: 'RECRUITER',
      title: 'Head of Talent Acquisition',
      companyName: 'Nexus AI Technologies',
      companyLocation: 'San Francisco, CA (Hybrid / Remote)',
      phone: '+1 (415) 762-9900',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Candidate seed
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@hireflow.io' },
    update: {},
    create: {
      name: 'Alex Chen',
      email: 'candidate@hireflow.io',
      passwordHash,
      role: 'CANDIDATE',
      title: 'Senior Full Stack & AI Engineer',
      location: 'San Francisco, CA (Remote)',
      phone: '+1 (415) 890-2341',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      candidateProfile: {
        create: {
          headline: 'Senior Full Stack & AI Engineer | Open to Opportunities',
          summary: '5+ years experience crafting performant React, TypeScript, Node.js applications and LLM agent pipelines.',
          location: 'San Francisco, CA (Remote)',
          phone: '+1 (415) 890-2341',
          skills: [
            { name: 'TypeScript', level: 'Expert' },
            { name: 'React', level: 'Expert' },
            { name: 'Node.js', level: 'Advanced' },
            { name: 'PostgreSQL', level: 'Advanced' },
            { name: 'Prisma ORM', level: 'Advanced' },
          ],
          experience: [
            {
              id: 'exp_1',
              title: 'Senior Full Stack Engineer',
              company: 'TechFlow Systems',
              location: 'San Francisco, CA',
              startDate: '2022-03',
              endDate: 'Present',
              current: true,
              description: 'Architected distributed AI workflow automation systems.',
            },
          ],
          education: [
            {
              id: 'edu_1',
              degree: 'B.S. in Computer Science',
              school: 'University of California, Berkeley',
              field: 'Software Engineering & AI',
              graduationYear: '2021',
            },
          ],
          resumeText: 'Senior Full Stack & AI Engineer with 5+ years experience in React, TypeScript, Node.js, and PostgreSQL.',
          profileStrength: 90,
        },
      },
    },
  });

  console.log(`Seeded recruiter: ${recruiter.email}, candidate: ${candidate.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
