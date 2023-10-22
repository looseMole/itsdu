import { useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { getQueryKeysFromParamsObject } from "@/lib/utils.ts";
import {
    GETinstantMessagesv2,
    GETinstantMessagesv2ApiUrl,
    GETinstantMessagesv2Params
} from "@/types/api-types/messages/GETinstantMessagesv2.ts";

export default function useGETinstantMessagesv2(params: GETinstantMessagesv2Params, queryConfig?: UseInfiniteQueryOptions<GETinstantMessagesv2, Error, GETinstantMessagesv2, GETinstantMessagesv2, string[]>) {
    return useInfiniteQuery({
        queryKey: ['messagesv2', ...getQueryKeysFromParamsObject(params)], queryFn: async ({ pageParam }) => {
            console.log('useGETmessages')

            const res = await axios.get(GETinstantMessagesv2ApiUrl({
                ...params,
                threadPage: pageParam as number
            }), {
                params: {
                    "access_token": localStorage.getItem('access_token') || '',
                }
            });

            if (res.status !== 200) throw new Error(res.statusText);

            return res.data;
        },
        initialPageParam: params.threadPage,
        getNextPageParam: (lastPage) => {
            console.log(lastPage.PageSize, lastPage.Total, lastPage.CurrentPageIndex, lastPage.CurrentPageIndex * lastPage.PageSize < lastPage.Total)
            if ((lastPage.CurrentPageIndex + 1) * lastPage.PageSize < lastPage.Total) {
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
        },
        ...queryConfig,
    })
}
