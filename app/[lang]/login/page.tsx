import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);

  return (
    <LoginForm 
      lang={lang} 
      dict={dict.auth} 
    />
  );
}
