import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}