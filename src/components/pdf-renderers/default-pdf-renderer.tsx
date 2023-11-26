import { ArrowLeftToLine, ArrowRightToLine, Loader2 } from "lucide-react"
import { Button, ButtonProps } from "../ui/button"
import { useAISidepanel } from "@/hooks/atoms/useAISidepanel"
import { cn } from "@/lib/utils"
import AISidepanelButton from "../ai-chat/ai-sidepanel-button"

export default function DefaultPdfRenderer({ isLoading, data }: { isLoading: boolean, data: string }) {
    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="h-10 w-10">
                    <Loader2 className={"stroke-foreground shrink-0 h-6 w-6 animate-spin m-auto"} />
                </div>
            </div>
        )
    }
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            <iframe src={data} className="h-full w-full" />
            <AISidepanelButton className="absolute inset-y-0 right-4 my-auto mr-4" variant={"secondary"} />
        </div>
    )
}
