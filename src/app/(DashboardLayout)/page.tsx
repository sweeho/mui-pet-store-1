import { LandingView } from "@/components/LandingView";
import { findUser } from "@/lib/users";

// Read on every request: the landing page still loads one row (design.md D2).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <LandingView firstUser={await findUser(1)} />;
}
