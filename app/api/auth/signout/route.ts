import { signOutService } from "@/server/services/authService";

export async function POST() {
  await signOutService();
  return Response.json({ data: { signedOut: true } });
}
