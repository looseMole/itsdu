import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import axios from "axios";
import {getQueryKeysFromParamsObject} from "@/lib/utils.ts";
import {
    GETlightbulletinAllComments,
    GETlightbulletinAllCommentsApiUrl,
    GETlightbulletinAllCommentsParams
} from "@/api-types/lightbulletin/GETlightbulletinAllComments.ts";

export default function useGETlightbulletinAllComments(params: GETlightbulletinAllCommentsParams, queryConfig?: UseQueryOptions<GETlightbulletinAllComments, Error, GETlightbulletinAllComments, string[]>) {

    return useQuery(['lightbulletinAllComments', ...getQueryKeysFromParamsObject(params)], async () => {
        const res = await axios.get(GETlightbulletinAllCommentsApiUrl({
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