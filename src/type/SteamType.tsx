export type SteamType = {
    quest_date: string;
    quest_status: string;
    uid: string;
    user_name: string;
    quest_img_url : string;
    quest_img_path : string;
};

export type Event = {
    start: string;
    display: string;
    uid: string;
    isSend: boolean;
    backgroundColor?: string;
    user_name: string;
    quest_img_url : string;
    quest_img_path : string;
};

export type DeleteEvent = {
    start: string;
    uid: string;
    user_name: string;
};
