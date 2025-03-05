import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

export function DesktopPetInfo() {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg bg-black/80 p-3 text-sm text-white shadow-lg">
      <div className="mb-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-green-400" />
        <span className="font-medium">PvZ Desktop Pet</span>
      </div>
      <p className="mb-2 text-xs text-gray-300">
        Want a real desktop pet? Click to deploy the Drake window so he can be on any site!
      </p>
      <Button
        className="w-full bg-green-500 text-xs font-bold hover:bg-green-600"
        onClick={() => {
          window.alert(
            "This would open Drake in a separate window that stays on top of other applications. In a real desktop app, this would allow Drake to appear on any website or application!",
          )
        }}
      >
        Deploy Drake Window
      </Button>
    </div>
  )
}

