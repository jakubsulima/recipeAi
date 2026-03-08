const Footer = () => {
  return (
    <footer className="w-full bg-secondary border-t border-primary/20 mt-auto py-4 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-text/60 text-sm">
        <span>© {new Date().getFullYear()} AI Kitchen. All rights reserved.</span>
        <span>Powered by Gemini AI</span>
      </div>
    </footer>
  );
};

export default Footer;
