import type { UserData } from "./index";

export interface UserProfileData {
    userData: UserData;
    setUserData: (data: UserData) => void;
}