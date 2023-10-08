import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {AlertCircle, MessageCircle} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollShadow} from "@nextui-org/react";
import {UnreadNotificationIndicator} from "@/components/messages/unread-notification-indicator";
import useGETinstantMessagesv2 from "@/queries/messages/useGETinstantMessagesv2.ts";
import {useInView} from "react-intersection-observer";
import {useEffect} from "react";

export default function MessagesDropdown() {
    const {data, fetchNextPage, hasNextPage, isFetchingNextPage} = useGETinstantMessagesv2({
        maxThreadCount: 15,
        // maxMessages: 1,
        threadPage: 0
    }, {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        suspense: true,
        getNextPageParam: (lastPage) => {
            console.log(lastPage.PageSize, lastPage.Total, lastPage.CurrentPageIndex, lastPage.CurrentPageIndex * lastPage.PageSize < lastPage.Total)
            if (lastPage.CurrentPageIndex * lastPage.PageSize < lastPage.Total) {
                return lastPage.CurrentPageIndex + 1;
            } else {
                return undefined;
            }
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage.CurrentPageIndex > 0) {
                return firstPage.CurrentPageIndex - 1;
            } else {
                return undefined;
            }
        }
    })
    const {ref, inView} = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage().then(r => console.log(r)).catch(e => console.log(e))
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    const threads = data?.pages.flatMap((page) => page.EntityArray)
    const total = data?.pages[0].Total

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={"shrink-0"}
                >
                    <MessageCircle/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
                <DropdownMenuLabel className={"flex justify-between items-center"}>
                    <span>
                        Messages
                    </span>
                    <span className={"text-xs text-muted-foreground"}>
                        {threads && total && `${threads.length}/${total}`}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    {!threads && (
                        <ScrollShadow
                            className={"w-full h-72 my-2 px-2 scrollbar hover:scrollbar-thumb-foreground/15 active:scrollbar-thumb-foreground/10 scrollbar-thumb-foreground/20 scrollbar-w-2 scrollbar-thumb-rounded-full"}>
                            <div className="pr-2 pb-2">
                                {[...Array(10)].map((_, idx) => (
                                    <>
                                        <div className={"flex gap-2 items-center justify-center w-full"}
                                             key={idx}>
                                            <span
                                                className="-ml-1 bg-primary shrink-0 grow-0 w-1.5 h-2.5 rounded-full"></span>
                                            <div className="space-y-2 w-full">
                                                <div
                                                    className="h-8 w-full flex justify-center items-center gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-full"/>
                                                    <Skeleton className="h-4 w-full"/>
                                                </div>
                                                <Skeleton className="h-4 w-full"/>
                                            </div>
                                        </div>
                                        <Separator
                                            className={cn("my-2", idx === 9 && "hidden")}/>
                                    </>
                                ))}
                            </div>
                        </ScrollShadow>
                    )}
                    {threads && (
                        <ScrollShadow
                            className={"h-72 w-full my-2 px-2 scrollbar hover:scrollbar-thumb-foreground/15 active:scrollbar-thumb-foreground/10 scrollbar-thumb-foreground/20 scrollbar-w-2 scrollbar-thumb-rounded-full"}>
                            {threads.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-6 h-72 w-full">
                                    <AlertCircle className={"stroke-destructive"}/>
                                    <h3 className="text-foreground font-medium text-xl mt-4">
                                        No messages
                                    </h3>
                                    <p className="text-muted-foreground text-center px-6">
                                        You currently don&apos;t have any messages.
                                    </p>
                                </div>
                            )}
                            {threads && threads.length > 0 && (
                                threads.map((thread, idx) => (
                                    <div key={idx}>
                                        <DropdownMenuItem>
                                            <div className="flex items-center justify-between group pr-2"
                                                 data-read={thread}>
                                                <div className="flex items-center gap-3">
                                                    <UnreadNotificationIndicator
                                                        read={thread.LastMessage.MessageId === thread.LastReadInstantMessageId}/>
                                                    <div className="flex flex-col gap-2">
                                                        <span
                                                            className="flex gap-2 items-center justify-start">
                                                            <Avatar>
                                                                <AvatarImage src={thread.LastMessage.CreatedByAvatar}
                                                                             alt={thread.LastMessage.CreatedByName}/>
                                                                <AvatarFallback>
                                                                    {thread.LastMessage.CreatedByName.split(" ").map((name) => name[0]).slice(0, 3).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span
                                                                className={"text-sm font-medium group-data-[read=true]:font-light text-foreground line-clamp-2"}>{thread.LastMessage.CreatedByName}</span>
                                                        </span>
                                                        <span
                                                            className={cn("group-data-[read=false]:font-medium text-xs text-muted-foreground w-full line-clamp-3", thread.LastMessage.MessageId !== thread.LastReadInstantMessageId && "font-semibold")}>{thread.LastMessage.Text.substring(0, 300)}</span>
                                                        <span
                                                            className="text-xs text-muted-foreground">{thread.LastMessage.CreatedLocalDateStamp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                        <Separator
                                            className={cn("my-2", idx === threads.length - 1 && "hidden")}/>
                                    </div>
                                ))
                            )}
                            {isFetchingNextPage && (
                                <>
                                    <Separator
                                        className={"my-2"}/>
                                    <div className="flex flex-col items-center justify-center py-6 h-72 w-full">
                                        <Skeleton className={"w-8 h-8 rounded-full"}/>
                                        <h3 className="text-foreground font-medium text-xl mt-4">
                                            Loading
                                        </h3>
                                        <p className="text-muted-foreground text-center px-6">
                                            Loading more messages...
                                        </p>
                                    </div>
                                </>
                            )}
                            {!hasNextPage && (
                                <>
                                    <Separator
                                        className={"my-2"}/>
                                    <div className="flex flex-col items-center justify-center py-6 h-72 w-full">
                                        <AlertCircle className={"stroke-destructive"}/>
                                        <h3 className="text-foreground font-medium text-xl mt-4">
                                            No more messages
                                        </h3>
                                        <p className="text-muted-foreground text-center px-6">
                                            You have reached the end of your messages.
                                        </p>
                                    </div>
                                </>
                            )}
                            {hasNextPage && <div ref={ref}/>}
                        </ScrollShadow>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}