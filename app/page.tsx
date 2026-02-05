'use client';

import { Suspense } from "react";

// import { useSearchParams } from "next/navigation";

export default function Page() {
  // const searchParams = useSearchParams();

  // const activeTab = searchParams.get('tab') || 'home';

  return (
    <Suspense fallback={<div className="p-8">Cargando navegación...</div>}>
      <div>
        <h1>Welcome to Next.js!</h1>
      </div>
    </Suspense>
  );
}
