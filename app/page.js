import AuthForm from '@/components/auth-form';

export default async function Home({ searchParams }) {
  const mode = await searchParams.mode;
  const formMode = mode || 'login';

  return <AuthForm mode={formMode} />;
}
