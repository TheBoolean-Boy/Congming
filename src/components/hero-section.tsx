"use client"
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import SplitText from "./SplitText";
import ElectricBorder from "./ElectricBorder";


export default function HeroSection() {

  const { user } = useUser()
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 sm:mb-12 lg:mb-16 mt-6">
        <Link href={'/dashboard'} >
          <ElectricBorder
            color="#FF0022"
            speed={1}
            chaos={0.5}
            thickness={2}
            style={{ borderRadius: 16 }}
          >

            
            <Button variant={'ghost'} className=" py-2 px-5 w-full sm:w-auto cursor-pointer hover:scale-105">
              <span className="text-xs sm:text-sm text-gray-700">
                {user ? 'Use your free 300 credits' : 'SignUp to get free 300 credits'}
              </span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>


            
          </ElectricBorder>
        </Link>
      </div>

      <div className="text-center max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-gray-900 leading-tight mb-6 sm:mb-8">
          <SplitText
            text="Codebase Interactions made faster, better, smarter with the help of AI Agents"
            className="text-6xl font-semibold text-center"
            delay={50}
            duration={0.4}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />

        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto px-2">
          Onboard your teams with lightning speed right now, ask any queries about your codebase and get ultrafast and 100% relevant responses.
          <br className="hidden sm:block" />
          <span className="sm:inline block mt-2 sm:mt-0"> Streamline your productions with refactoring and scanning agents.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href={'/dashboard'}
            className="w-full sm:w-auto "
          >
            <Button className="w-full sm:w-auto cursor-pointer">
              {user ? 'Dashboard' : 'SignIn'}
              <ArrowRight className="ml-2" />
            </Button>
          </Link>

          <ElectricBorder
            color="#39FF14"
            // color="#FF0022"
            speed={1}
            chaos={0.5}
            thickness={2}
            style={{ borderRadius: 16 }}
          >
          <Link href={'#'} className="w-full sm:w-auto ">
            <Button variant={'ghost'} className="w-full sm:w-auto cursor-pointer hover:scale-105">
              Check Out Demo Video
            </Button>
          </Link>
          </ElectricBorder>
        </div>
      </div>
    </div>
  );
}