import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="Shield">
            🛡️
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Skill Audit</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Security scanner for Claude skills
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
