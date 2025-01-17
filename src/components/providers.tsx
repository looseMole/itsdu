import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {domAnimation, LazyMotion} from "framer-motion";
import {ThemeProvider} from "next-themes";
import {HelmetProvider} from "react-helmet-async";

export default function Providers({children}: {
    children: React.ReactNode
}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                retry: false,
                refetchInterval: 1000 * 60 * 5, // 5 minutes
                keepPreviousData: true,
                refetchOnReconnect: "always",
            }
        },
    })

    return (
        <HelmetProvider>
            <ThemeProvider attribute={"class"} enableSystem>
                <QueryClientProvider client={queryClient}>
                    {/*<div className={"overflow-x-auto"}>*/}
                    <LazyMotion features={domAnimation}>
                        {children}
                    </LazyMotion>
                    {/*</div>*/}
                </QueryClientProvider>
            </ThemeProvider>
        </HelmetProvider>
    )
}