import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getQueryKeysFromParamsObject } from "@/lib/utils.ts";
import {
    POSTlightbulletinAddComment,
    POSTlightbulletinAddCommentApiUrl,
    POSTlightbulletinAddCommentBody,
    POSTlightbulletinAddCommentParams
} from "@/types/api-types/lightbulletin/POSTlightbulletinAddComment.ts";
import axios from "axios";

export default function usePOSTlightbulletinAddComment(params: POSTlightbulletinAddCommentParams, queryConfig?: UseMutationOptions<POSTlightbulletinAddComment, Error, POSTlightbulletinAddCommentBody, string[]>) {

    return useMutation({
        mutationKey: ['lightbulletinAddComment', ...getQueryKeysFromParamsObject(params)], mutationFn: async (body) => {
            const res = await axios.post(POSTlightbulletinAddCommentApiUrl({
                ...params
            }), body, {
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