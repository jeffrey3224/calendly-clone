"use client"

import { SignIn } from "@clerk/nextjs"
import { neobrutalism } from "@clerk/themes"
import Image from "next/image"

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen p-5 sm:px-15 bg-gradient-to-r from-blue-100 to-blue-200 animate-fade-in">
  {/* Logo at the top */}
  <div className="flex justify-center pt-5">
    <Image
      src="/assets/logo-alternate.svg"
      width={250}
      height={20}
      alt="logo"
      className="w-30 sm:w-40 md:w-60 lg:w-70"
    />
  </div>

  {/* Centered content below logo */}
  <div className="flex flex-col lg:flex-row items-center justify-center flex-1 py-10 lg:gap-24 max-lg:flex-col">
    <div className="order-2 lg:order-1">
      <SignIn
        routing="hash"
        appearance={{ baseTheme: neobrutalism }}
      />
    </div>

    <section className="flex flex-col items-center order-1 lg:order-2 pb-7 lg:pb-0">
      <h1 className="text-3xl font-black lg:text-4xl pb-2">
        Your time, perfectly planned
      </h1>
      <p className="text-[1.1rem] font-bold text-gray-700 max-w-[500px]">
        Join millions of professionals who easily book meetings with the #1 scheduling tool
      </p>

      <Image
        src="/assets/planning.svg"
        width={500}
        height={500}
        alt="illustration"
        role="presentation"
        className="w-60 lg:w-120"
      />
    </section>
  </div>
</main>

  )
}