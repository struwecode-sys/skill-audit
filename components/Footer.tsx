export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Skill Audit is free and open source. All processing happens locally or
          on Vercel serverless functions.
        </p>
        <p className="mt-1">No data is stored. No AI APIs are called.</p>
      </div>
    </footer>
  );
}
