import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3ed] px-5 text-[#234438]">
      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d2765d]">good & groomed</p>
        <h1 className="mt-4 font-display text-6xl font-bold tracking-[-0.06em]">404</h1>
        <p className="mt-3 text-lg text-[#6d796e]">This page wandered off.</p>
        <Link className="mt-7 inline-flex rounded-full bg-[#234438] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#315847]" to="/">
          Return to your estimate
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
