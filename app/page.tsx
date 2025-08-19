"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="container flex items-center justify-center h-[calc(100vh-2rem)]">
      <section className="sub-container max-w-3xl text-center">
        <h1 className="header bg-gradient-to-r from-green-500 to-blue-500 clip-text">
          CarePulse
        </h1>
        <p className="text-16-regular mt-4 text-dark-700">
          Schedule healthcare appointments and get timely reminders. No signup required.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/appointments"
            className="shad-primary-btn rounded-md px-6 py-3 text-16-semibold"
          >
            Schedule an appointment
          </Link>
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noreferrer"
            className="shad-gray-btn rounded-md px-6 py-3 text-16-semibold"
          >
            Learn more
          </a>
        </div>
        <p className="copyright mt-20">© {new Date().getFullYear()} CarePulse</p>
      </section>
    </main>
  );
}