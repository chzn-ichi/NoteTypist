import AuthForm from "@/components/AuthForm";
import Page from "@/components/Page";

export default function LoginPage() {
  return (
    <Page narrow back={{ href: "/", label: "Back to home" }}>
      <AuthForm />
    </Page>
  );
}