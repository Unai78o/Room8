'use client';

import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'home';

  return (
    <div>
      <h1>Welcome to Next.js!</h1>
    </div>
  );
}
