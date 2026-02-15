"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("../src/prisma");
dotenv_1.default.config();
async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@pm.local';
    const password = process.env.ADMIN_PASSWORD || 'admin12345';
    const existing = await prisma_1.prisma.adminUser.findUnique({ where: { email } });
    if (existing)
        return;
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    await prisma_1.prisma.adminUser.create({
        data: {
            email,
            passwordHash
        }
    });
}
main()
    .then(async () => {
    await prisma_1.prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
