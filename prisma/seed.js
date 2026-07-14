import { PrismaClient } from '@prisma/client';
import generateUniqueId from '../src/utils/unique-id.js';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_USER;

    if (!email) {
        console.log('ADMIN_USER is not set -- skipping admin seed.');
        return;
    }

    const admin = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN', isEnabled: true },
        create: { uuid: generateUniqueId(), email, role: 'ADMIN', isEnabled: true },
    });

    console.log(`Admin user ready: ${admin.email} (${admin.uuid})`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
