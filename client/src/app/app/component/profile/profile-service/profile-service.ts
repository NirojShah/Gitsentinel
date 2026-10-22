import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export type ProfileIcon = {
    initials: string
}

export type ProfileInfo = {
    name: string,
    email: string,
    username: string,
    isActive: string,
    isVerified: string
}

@Injectable({
    providedIn: "root"
})

export class ProfileService {
    profileIcon: ProfileIcon | null = null
    constructor(private readonly http: HttpClient) { }
    apiUrl: string = "http://localhost:5000/app/v1/user/profile"
    
    fetchProfileInfo(): Promise<ProfileInfo> {
        throw new Error("Method not implemented.");
    }

    fetchprofileIcon(name: string) {
        const nameArr = name.split(" ")
        let initials = ""
        if (nameArr.length > 1) {
            initials = nameArr[0][0] + nameArr[1][0]
        } else {
            initials = nameArr[0][0]
        }
        this.profileIcon = { initials: initials.toUpperCase() }
    }

}