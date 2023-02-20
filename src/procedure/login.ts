'use strict';
import { Request, Response, NextFunction } from 'express';
import { AccountSocialTypeEnum } from '../util/types';
import { RequestGetJson } from '../util/utils';
export async function LoginProc(req: Request, res: Response) {
    var social_type = req.body["social_type"];
    var access_token = req.body["access_token"];

    try {
        switch (social_type) {
            case AccountSocialTypeEnum.Guest:
                //access_token 이게 아이디
                return;
            case AccountSocialTypeEnum.Google:
                try {
                    const result = await RequestGetJson(`https://oauth2.googleapis.com/tokeninfo?id_token=${access_token}`);
                    if (result["error"] !== undefined) {
                        console.log(result["error"]);
                        return;
                    }

                    //todo config에 넣고 같은지 체크해야 함
                    const client_id = result["aud"];
                    if (client_id === undefined) {
                        return;
                    }
                    const user_id = result["sub"];

                    return;
                }
                catch (error) {
                    console.log(error);
                    return;
                }
                break;
            case AccountSocialTypeEnum.Apple:
                {

                }
                break;
            case AccountSocialTypeEnum.Facebook:
                try {
                    const result = await RequestGetJson(`https://graph.facebook.com/me?fields=id,email&access_token=${access_token}`);
                    if (result["error"] !== undefined) {
                        return;
                    }

                    //return { user_id: body["id"], email: body["email"] };
                }
                catch (error) {
                    console.log(error);
                    return;
                }
                break;
            default:
                //callback("not exists social_type");
                break;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }

}
