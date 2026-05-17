import { HomePage } from "@/components/marketing/home-page";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getAuthenticatedUser();
  return <HomePage user={user} />;
}
