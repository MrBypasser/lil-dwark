"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"

// Define the possible actions/events for Lil Drake
type DrakeAction =
  | "idle"
  | "walking"
  | "dancing"
  | "shooting"
  | "jumping"
  | "sleeping"
  | "eating"
  | "laughing"
  | "spinning"
  | "vanishing"
  | "transforming"
  | "planting"
  | "exploding"
  | "waving"
  | "hiding"
  | "celebrating"
  | "scared"
  | "zombie"
  | "sunglasses"
  | "rainbow"
  | "happy"
  | "dizzy"
  | "pet"

interface Position {
  x: number
  y: number
}

interface DrakeState {
  position: Position
  direction: "left" | "right"
  action: DrakeAction
  speed: number
  scale: number
}

export default function DrakePet() {
  const [drake, setDrake] = useState<DrakeState>({
    position: { x: 100, y: 100 },
    direction: "right",
    action: "idle",
    speed: 2,
    scale: 1,
  })

  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [clickCount, setClickCount] = useState(0)
  const [petCount, setPetCount] = useState(0)

  const drakeRef = useRef<HTMLDivElement>(null)
  const drakeSize = { width: 100, height: 100 }
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize window size
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    updateWindowSize()

    // Update on resize
    window.addEventListener("resize", updateWindowSize)

    return () => {
      window.removeEventListener("resize", updateWindowSize)
    }
  }, [])

  // Handle Drake's movement
  useEffect(() => {
    if (windowSize.width === 0 || isDragging) return

    const moveInterval = setInterval(() => {
      if ((drake.action === "idle" || drake.action === "walking") && !isDragging) {
        setDrake((prevDrake) => {
          // Calculate new position
          let newX = prevDrake.position.x
          let newY = prevDrake.position.y
          let newDirection = prevDrake.direction

          if (prevDrake.action === "walking") {
            if (prevDrake.direction === "right") {
              newX += prevDrake.speed
              if (newX > windowSize.width - drakeSize.width) {
                newDirection = "left"
              }
            } else {
              newX -= prevDrake.speed
              if (newX < 0) {
                newDirection = "right"
              }
            }

            // Occasionally change Y position
            if (Math.random() < 0.05) {
              const moveUp = Math.random() > 0.5
              newY += moveUp ? -5 : 5

              // Keep within bounds
              newY = Math.max(0, Math.min(windowSize.height - drakeSize.height, newY))
            }
          }

          return {
            ...prevDrake,
            position: { x: newX, y: newY },
            direction: newDirection,
          }
        })
      }
    }, 50)

    movementIntervalRef.current = moveInterval

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current)
      }
    }
  }, [drake.action, windowSize, isDragging])

  // Handle random actions
  useEffect(() => {
    if (isDragging) return

    const randomActionInterval = setInterval(() => {
      if (!isDragging && drake.action !== "pet" && drake.action !== "happy" && drake.action !== "dizzy") {
        const randomAction = getRandomAction()
        const actionDuration = getActionDuration(randomAction)

        setDrake((prevDrake) => ({
          ...prevDrake,
          action: randomAction,
          speed: randomAction === "walking" ? Math.random() * 3 + 1 : prevDrake.speed,
        }))

        // Reset to idle or walking after the action duration
        if (actionTimeoutRef.current) {
          clearTimeout(actionTimeoutRef.current)
        }

        actionTimeoutRef.current = setTimeout(() => {
          setDrake((prevDrake) => ({
            ...prevDrake,
            action: Math.random() > 0.5 ? "idle" : "walking",
          }))
        }, actionDuration)
      }
    }, 5000) // Check for new actions every 5 seconds

    return () => {
      clearInterval(randomActionInterval)
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current)
      }
    }
  }, [drake.action, isDragging])

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click only
      const rect = drakeRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        setIsDragging(true)

        // Track clicks for double-click detection
        setClickCount((prev) => prev + 1)
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }

        clickTimeoutRef.current = setTimeout(() => {
          if (clickCount === 1) {
            // Single click action
            handlePet()
          } else if (clickCount >= 2) {
            // Double click action
            handleDoubleClick()
          }
          setClickCount(0)
        }, 300)
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Keep within window bounds
      const boundedX = Math.max(0, Math.min(windowSize.width - drakeSize.width, newX))
      const boundedY = Math.max(0, Math.min(windowSize.height - drakeSize.height, newY))

      setDrake((prev) => ({
        ...prev,
        position: { x: boundedX, y: boundedY },
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Set up global mouse event listeners for dragging
  useEffect(() => {
    const handleMove = (e: MouseEvent) => handleMouseMove(e)
    const handleUp = () => handleMouseUp()
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [])

  // Interaction handlers
  const handlePet = () => {
    setPetCount((prev) => prev + 1)
    setDrake((prev) => ({
      ...prev,
      action: "pet",
      scale: 1.1,
    }))

    // Show happy reaction after 5 pets
    if (petCount >= 4) {
      setTimeout(() => {
        setDrake((prev) => ({
          ...prev,
          action: "happy",
        }))
        setPetCount(0)
      }, 500)

      // Return to normal after reaction
      setTimeout(() => {
        setDrake((prev) => ({
          ...prev,
          action: "idle",
          scale: 1,
        }))
      }, 2500)
    } else {
      // Return to normal after petting
      setTimeout(() => {
        setDrake((prev) => ({
          ...prev,
          action: "idle",
          scale: 1,
        }))
      }, 1000)
    }
  }

  const handleDoubleClick = () => {
    setDrake((prev) => ({
      ...prev,
      action: "dizzy",
    }))

    // Return to normal after dizzy
    setTimeout(() => {
      setDrake((prev) => ({
        ...prev,
        action: "idle",
      }))
    }, 3000)
  }

  const handleFeed = () => {
    setDrake((prev) => ({
      ...prev,
      action: "eating",
    }))

    // Return to normal after eating
    setTimeout(() => {
      setDrake((prev) => ({
        ...prev,
        action: "happy",
      }))

      setTimeout(() => {
        setDrake((prev) => ({
          ...prev,
          action: "idle",
        }))
      }, 1500)
    }, 2000)
  }

  const handlePlay = () => {
    setDrake((prev) => ({
      ...prev,
      action: "dancing",
    }))

    // Return to normal after playing
    setTimeout(() => {
      setDrake((prev) => ({
        ...prev,
        action: "idle",
      }))
    }, 3000)
  }

  const handleScare = () => {
    setDrake((prev) => ({
      ...prev,
      action: "scared",
    }))

    // Return to normal after being scared
    setTimeout(() => {
      setDrake((prev) => ({
        ...prev,
        action: "idle",
      }))
    }, 2000)
  }

  // Helper functions for actions
  const getRandomAction = (): DrakeAction => {
    const actions: DrakeAction[] = [
      "idle",
      "walking",
      "dancing",
      "shooting",
      "jumping",
      "sleeping",
      "eating",
      "laughing",
      "spinning",
      "vanishing",
      "transforming",
      "planting",
      "exploding",
      "waving",
      "hiding",
      "celebrating",
      "scared",
      "zombie",
      "sunglasses",
      "rainbow",
    ]
    const weights = [15, 25, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < actions.length; i++) {
      if (random < weights[i]) {
        return actions[i]
      }
      random -= weights[i]
    }

    return "idle"
  }

  const getActionDuration = (action: DrakeAction): number => {
    switch (action) {
      case "idle":
        return 2000 + Math.random() * 3000
      case "walking":
        return 3000 + Math.random() * 5000
      case "dancing":
        return 3000 + Math.random() * 2000
      case "shooting":
        return 1500 + Math.random() * 1000
      case "jumping":
        return 1000 + Math.random() * 500
      case "sleeping":
        return 5000 + Math.random() * 5000
      case "eating":
        return 2000 + Math.random() * 1000
      case "laughing":
        return 2000 + Math.random() * 1000
      case "spinning":
        return 1500 + Math.random() * 500
      case "vanishing":
        return 2000 + Math.random() * 1000
      case "transforming":
        return 2500 + Math.random() * 1000
      case "planting":
        return 2000 + Math.random() * 1000
      case "exploding":
        return 1000 + Math.random() * 500
      case "waving":
        return 1500 + Math.random() * 1000
      case "hiding":
        return 3000 + Math.random() * 2000
      case "celebrating":
        return 2500 + Math.random() * 1500
      case "scared":
        return 1500 + Math.random() * 1000
      case "zombie":
        return 3000 + Math.random() * 2000
      case "sunglasses":
        return 4000 + Math.random() * 3000
      case "rainbow":
        return 3000 + Math.random() * 2000
      case "pet":
        return 1000
      case "happy":
        return 2000
      case "dizzy":
        return 3000
      default:
        return 2000
    }
  }

  // Get animation class based on current action
  const getAnimationClass = (): string => {
    switch (drake.action) {
      case "idle":
        return "animate-pulse"
      case "dancing":
        return "animate-bounce"
      case "jumping":
        return "animate-jump"
      case "spinning":
        return "animate-spin"
      case "vanishing":
        return "animate-pulse opacity-50"
      case "laughing":
        return "animate-shake"
      case "transforming":
        return "animate-transform"
      case "exploding":
        return "animate-explode"
      case "waving":
        return "animate-wave"
      case "hiding":
        return "opacity-70"
      case "celebrating":
        return "animate-bounce"
      case "scared":
        return "animate-shake"
      case "rainbow":
        return "animate-rainbow"
      case "pet":
        return "animate-pulse"
      case "happy":
        return "animate-bounce"
      case "dizzy":
        return "animate-spin"
      default:
        return ""
    }
  }

  // Get action description for tooltip
  const getActionDescription = (): string => {
    switch (drake.action) {
      case "idle":
        return "Just chillin'"
      case "walking":
        return "Taking a stroll"
      case "dancing":
        return "Busting some zombie moves!"
      case "shooting":
        return "Pew pew! Shooting zombies!"
      case "jumping":
        return "Boing! Boing!"
      case "sleeping":
        return "Zzz... Zombie nap time"
      case "eating":
        return "Nom nom nom... Brainz!"
      case "laughing":
        return "Hehehe! That's funny!"
      case "spinning":
        return "Wheeeeee!"
      case "vanishing":
        return "Now you see me, now you don't!"
      case "transforming":
        return "Time for a new look!"
      case "planting":
        return "Planting a little friend!"
      case "exploding":
        return "BOOM! Don't worry, I'm fine!"
      case "waving":
        return "Hello there!"
      case "hiding":
        return "You can't see me!"
      case "celebrating":
        return "Victory dance!"
      case "scared":
        return "Eek! A plant!"
      case "zombie":
        return "BRAAAINZ!"
      case "sunglasses":
        return "Looking cool!"
      case "rainbow":
        return "Taste the rainbow!"
      case "pet":
        return "Aww, that feels nice!"
      case "happy":
        return "So happy!"
      case "dizzy":
        return "Whoa, I'm seeing stars!"
      default:
        return ""
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={drakeRef}
          className={`fixed z-50 cursor-grab select-none ${isDragging ? "cursor-grabbing" : ""}`}
          style={{
            left: `${drake.position.x}px`,
            top: `${drake.position.y}px`,
            transform: `scaleX(${drake.direction === "left" ? -1 : 1}) scale(${drake.scale})`,
            transition: isDragging ? "none" : "left 0.05s linear, top 0.05s linear, transform 0.2s ease",
          }}
          title={getActionDescription()}
          onMouseDown={handleMouseDown}
        >
          <div
            className={`relative h-[100px] w-[100px] ${getAnimationClass()}`}
            style={{
              transform:
                drake.action === "transforming" ? `scale(${1 + Math.sin(Date.now() / 200) * 0.2})` : "scale(1)",
            }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OIP-46c9pqKNRYXfSpeOgqPdxp6Dz9vqrm.jpeg"
              alt="Lil Drake"
              fill
              className={`object-contain ${drake.action === "hiding" ? "translate-x-1/4" : ""}`}
              priority
              draggable="false"
            />

            {/* Action effects */}
            {drake.action === "shooting" && (
              <div className="absolute -right-4 top-1/2 h-2 w-8 animate-ping rounded-full bg-green-500" />
            )}

            {drake.action === "sleeping" && <div className="absolute -top-4 right-0 text-xl">💤</div>}

            {drake.action === "eating" && <div className="absolute -top-4 right-0 text-xl">🧠</div>}

            {drake.action === "laughing" && <div className="absolute -top-4 right-0 text-xl">😂</div>}

            {drake.action === "planting" && <div className="absolute -bottom-2 right-0 text-xl">🌱</div>}

            {drake.action === "exploding" && (
              <div className="absolute -top-4 -left-4 -right-4 -bottom-4 animate-ping text-2xl">💥</div>
            )}

            {drake.action === "waving" && <div className="absolute -top-4 -right-2 animate-wave text-xl">👋</div>}

            {drake.action === "celebrating" && <div className="absolute -top-6 left-0 right-0 text-xl">🎉</div>}

            {drake.action === "scared" && <div className="absolute -top-6 right-0 text-xl">😱</div>}

            {drake.action === "zombie" && <div className="absolute -top-6 right-0 text-xl">🧟</div>}

            {drake.action === "sunglasses" && <div className="absolute top-1/4 left-1/4 z-10 text-xl">😎</div>}

            {drake.action === "rainbow" && <div className="absolute -top-8 left-0 right-0 text-xl">🌈</div>}

            {drake.action === "happy" && <div className="absolute -top-6 right-0 text-xl">❤️</div>}

            {drake.action === "dizzy" && <div className="absolute -top-6 right-0 text-xl">💫</div>}

            {drake.action === "pet" && <div className="absolute -top-6 right-0 text-xl">✨</div>}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handlePet}>Pet Drake ✨</ContextMenuItem>
        <ContextMenuItem onClick={handleFeed}>Feed Drake 🧠</ContextMenuItem>
        <ContextMenuItem onClick={handlePlay}>Play with Drake 🎮</ContextMenuItem>
        <ContextMenuItem onClick={handleScare}>Scare Drake 👻</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

