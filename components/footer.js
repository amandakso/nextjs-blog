export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <p>© {new Date().getFullYear()} </p>
        </div>
      </div>
    </footer>
  );
}
