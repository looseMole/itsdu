import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { getQueryKeysFromParamsObject } from "@/lib/utils.ts";
import {
    GETcourseLastThreeUpdatedResources,
    GETcourseLastThreeUpdatedResourcesApiUrl,
    GETcourseLastThreeUpdatedResourcesParams
} from "@/types/api-types/courses/GETcourseLastThreeUpdatedResources.ts";

export default function useGETcourseLastThreeUpdatedResources(params: GETcourseLastThreeUpdatedResourcesParams, queryConfig?: UseQueryOptions<GETcourseLastThreeUpdatedResources, Error, GETcourseLastThreeUpdatedResources, string[]>) {

    return useQuery({
        queryKey: ['courseFolderResources', ...getQueryKeysFromParamsObject(params)], queryFn: async () => {
            const res = await axios.get(GETcourseLastThreeUpdatedResourcesApiUrl({
                ...params
            }), {
                params: {
                    "access_token": localStorage.getItem('access_token') || '',
                    ...params,
                }
            });

            if (res.status !== 200) throw new Error(res.statusText);

            return res.data;
        },
        ...queryConfig
    })
}