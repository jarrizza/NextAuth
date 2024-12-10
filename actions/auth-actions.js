'use server';
import { hashUserPassword, verifyPassword } from '@/lib/hash';
import { redirect } from 'next/navigation';
import { createUser } from '@/lib/user';
import { getUserByEmail } from '@/lib/user';
import { createAuthSession } from '@/lib/auth';
import { destroySession } from '@/lib/auth';

export async function signup(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    let errors = {};

    if (!email) {
        errors.email = 'Email is required';
    } else if (!email.includes('@')) {
        errors.email = 'Please enter a valid email';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (password.trim().length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }   

    // hash the password
    const hashedPassword = hashUserPassword(password);

    // store it in the database
    try {
        const id = createUser(email, hashedPassword);
        await createAuthSession(id);
        redirect('/training');
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { 
                errors: { email: 'Email already exists' }
             };
        }
       throw error;
    }

}

const authError = { errors: { email: 'Could not find this account, please check your credentials.' } };

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const existingUser = getUserByEmail(email);
    if (!existingUser) return authError;

    const isValidPassword = verifyPassword(existingUser.password, password);
    if (!isValidPassword) return authError;

    await createAuthSession(existingUser.id);
    redirect('/training');
}

export async function auth(mode, prevState, formData) {
    if (mode === 'login') {
        return login(prevState, formData);
    } else {
        return signup(prevState, formData);
    }
}

export async function logout() {
    // remove the auth session
    await destroySession();
    redirect('/');
}

