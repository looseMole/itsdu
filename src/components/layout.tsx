import {Outlet, useNavigation} from "react-router-dom";
import BrowserNav from "./browse-nav";
import {Suspense} from "react";
import {Spinner} from "@nextui-org/spinner";
import Header from "@/components/header";
import {Toaster} from "@/components/ui/toaster.tsx";


export default function Layout() {
    const navigation = useNavigation();

    if (navigation.state === "loading") {
        return (
            <div className="min-h-[100dvh] min-w-[100dvw] flex flex-1 flex-col w-full max-h-[100dvh] overflow-hidden">
                <Spinner size="lg" color="primary" label="Loading..." className={"m-auto"}/>
            </div>
        )
    }
    return (
        <div className="min-h-[100dvh] min-w-[100dvw] flex flex-1 flex-col w-full max-h-[100dvh] overflow-hidden">
            <div className={"flex flex-shrink-0 flex-grow-0 flex-col"}>
                <BrowserNav/>
                <Header/>
            </div>
            <Suspense
                fallback={<Spinner size="lg" color="primary" label="Loading..." className={"m-auto"}/>}>
                <div className="flex flex-1 flex-col overflow-x-auto" style={{
                    scrollbarGutter: "stable both-edges"
                }}>
                    <Outlet/>
                    <Toaster/>
                </div>
            </Suspense>
        </div>
    )
}
