import { auth } from "../lib/auth"; 
import { prisma } from "../lib/prisma";
import { UserRole } from "../lib/auth"; 

async function seedAdmin() {
    try {
        console.log("****** Admin Seeding Started...");
        
        const adminData = {
            name: "Admin Saheb",
            email: "admin@admin.com",
            password: "admin1234",
            phone: "0132211223344",
            role: UserRole.USER 
        };

        const existingUser = await prisma.user.findUnique({
            where: { email: adminData.email }
        });

        if (existingUser) {
            console.log("⚠️ User already exists!");
            if (existingUser.role !== UserRole.ADMIN || !existingUser.emailVerified) {
                 await prisma.user.update({
                    where: { email: adminData.email },
                    data: { 
                        role: UserRole.ADMIN,
                        emailVerified: true 
                    }
                });
                console.log("🔄 Existing user updated to ADMIN & Verified.");
            }
            return;
        }
        
        console.log("⏳ Creating user via Internal Auth API...");


        await auth.api.signUpEmail({
            body: {
                name: adminData.name,
                email: adminData.email,
                password: adminData.password,
                role: adminData.role,
                phone: adminData.phone
            },
            asResponse: false
        });

        console.log("**** User Created via API. Now Updating Role...");

        await prisma.user.update({
            where: { email: adminData.email },
            data: {
                role: UserRole.ADMIN,        
                emailVerified: true   
            }
        });

        console.log("✅ Admin Created successfully via Seeding!");
        console.log("***** Success *****");

    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();