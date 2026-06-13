import { redirect } from "next/navigation";

const SYSEM_URL = process.env.SYSEM_URL || "https://sysem.it";

export default function LoginPage() {
  redirect(`${SYSEM_URL}/access.html`);
}
