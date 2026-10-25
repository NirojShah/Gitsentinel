import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "../../../core/api-base-url";

export type ProfileIcon = {
    initials: string
}

export type ProfileInfo = {
    name: string | null,
    email: string,
    username: string,
    isActive: boolean,
    isVerified: boolean
}

@Injectable({
    providedIn: "root"
})

export class ProfileService {
    profileIcon: ProfileIcon | null = null
    constructor(private readonly http: HttpClient) { }
    apiUrl: string = `${API_BASE_URL}/user/profile`
    
    async fetchProfileInfo(): Promise<ProfileInfo> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("You must be signed in to load your profile.");
        }
        const response = await firstValueFrom(this.http.get<{ data: ProfileInfo }>(this.apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
        }));
        return response.data;
    }

    fetchprofileIcon(name: string) {
        const nameArr = name.trim().split(/\s+/)
        const initials = nameArr
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
        this.profileIcon = { initials: initials.toUpperCase() || "A" }
    }

}