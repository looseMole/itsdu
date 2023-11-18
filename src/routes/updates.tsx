import useGETnotificationsStream from "@/queries/notifications/useGETnotificationsStream";
import {Suspense, useEffect} from "react";
import {useInView} from "react-intersection-observer";
import {Skeleton} from "@nextui-org/react";
import NotificationCard from "@/components/notifications/notifications-card";


export default function Updates() {
    const {data: updates, fetchNextPage, hasNextPage, isFetchingNextPage} = useGETnotificationsStream({
        showLightBulletins: true,
        PageIndex: 0,
        PageSize: 10,
        UseNewerThan: true,
    }, {
        suspense: true,
        keepPreviousData: true,
    })

    const {ref, inView} = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    return (
        <div className="rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Recent Updates</h1>
            <div className="flex flex-col gap-4">
                {updates && updates.pages.map((page) => (
                    page.EntityArray.map((update) => (
                        <Suspense fallback={
                            <Skeleton className="bg-foreground/10 rounded-md py-8"/>
                        } key={update.NotificationId}>
                            <NotificationCard key={update.NotificationId} notification={update}/>
                        </Suspense>
                    ))
                ))}
            </div>
            <div ref={ref} className="text-center mt-4 text-gray-600 text-sm">
                {isFetchingNextPage ? 'Fetching more notifications...' : 'End of notifications'}
            </div>
        </div>
    )
}