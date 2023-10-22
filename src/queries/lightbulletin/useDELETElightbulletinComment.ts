import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";
import { getQueryKeysFromParamsObject } from "@/lib/utils.ts";
import {
    DELETElightbulletinComment,
    DELETElightbulletinCommentApiUrl,
    DELETElightbulletinCommentParams
} from "@/types/api-types/lightbulletin/DELETElightbulletinComment.ts";

export default function useDELETElightbulletinComment(params: DELETElightbulletinCommentParams, queryConfig?: UseMutationOptions<DELETElightbulletinComment, Error, DELETElightbulletinCommentParams, string[]>) {

    return useMutation({
        mutationKey: ['lightbulletinComment', ...getQueryKeysFromParamsObject(params)], mutationFn: async () => {
            const res = await axios.delete(DELETElightbulletinCommentApiUrl({
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