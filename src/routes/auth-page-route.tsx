import { ForgotPasswordPage, LoginPage, RegisterPage } from "../pages/public-pages";

export default function AuthPageRoute({ pathname }: { pathname: string }) {
  if (pathname === "/inscription") return <RegisterPage />;
  if (pathname === "/mot-de-passe-oublie") return <ForgotPasswordPage />;
  return <LoginPage />;
}
