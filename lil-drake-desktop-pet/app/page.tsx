"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import DrakePet from "@/components/drake-pet"
import { DesktopPetInfo } from "@/components/desktop-pet-info"

export default function Home() {
  const [isDrakeDeployed, setIsDrakeDeployed] = useState(false)

  const deployDrake = () => {
    setIsDrakeDeployed(true)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-purple-700 p-4">
      <div className="z-10 w-full max-w-md rounded-xl bg-black/20 p-8 backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="mb-2 text-3xl font-bold text-green-400">Lil Drake Desktop Pet</h1>
          <p className="text-purple-200">Deploy Lil Drake from Plants vs Zombies Garden Warfare 2 to your desktop!</p>
        </div>

        {!isDrakeDeployed ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-full border-4 border-green-400 bg-purple-800">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OIP-46c9pqKNRYXfSpeOgqPdxp6Dz9vqrm.jpeg"
                alt="Lil Drake from Plants vs Zombies"
                fill
                className="object-cover"
                priority
              />
            </div>
            <Button onClick={deployDrake} className="w-full bg-green-500 text-lg font-bold hover:bg-green-600">
              Deploy Drake
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-green-300">
              Lil Drake is now deployed! He&apos;ll wander around your screen and perform random actions.
            </p>
            <Button
              onClick={() => setIsDrakeDeployed(false)}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/20"
            >
              Recall Drake
            </Button>
          </div>
        )}
      </div>

      {isDrakeDeployed && (
        <>
          <DrakePet />
          <DesktopPetInfo />
        </>
      )}
    </main>
  )
}

