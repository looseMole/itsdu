import {
    GETcalenderEvent,
    GETcalenderEventApiUrl,
    GETcalenderEventParams
} from "@/api-types/calendar/GETcalenderEvent.ts";
import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import axios from "axios";
import {getQueryKeysFromParamsObject} from "@/lib/utils.ts";

export default function useGETcalendarEvent(params: GETcalenderEventParams, queryConfig?: UseQueryOptions<GETcalenderEvent, Error, GETcalenderEvent, string[]>) {

    return useQuery(['calendarEvent', ...getQueryKeysFromParamsObject(params)], async () => {
        const res = await axios.get(GETcalenderEventApiUrl({
            ...params
        }), {
            params: {
                "access_token": localStorage.getItem('access_token') || '',
                ...params,
            }
        });

        if (res.status !== 200) throw new Error(res.statusText);

        return res.data;
    }, {
        ...queryConfig
    })
}