import Link from 'next/link';

export function NavBar() {
  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">Maya</Link>
        <nav className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/intake">Intake</Link>
          <Link href="/inventory">Inventory</Link>
          <Link href="/dossier">Dossier</Link>
          <Link href="/refine">Refine</Link>
        </nav>
      </div>
    </header>
  );
}