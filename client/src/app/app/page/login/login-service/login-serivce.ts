import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { catchError, throwError, tap } from "rxjs";

type LoginResponse = {
    message: string;
    data: {
        token: string;
    };
};

@Injectable({
    providedIn: "root"
})
class LoginService {
    private readonly apiUrl =
        "http://localhost:5000/app/v1/user/login";

    private readonly http = inject(HttpClient);

    errorMessage = signal<string>("");

    login(email: string, password: string) {
        this.errorMessage.set("");

        return this.http
            .post<LoginResponse>(this.apiUrl, {
                email,
                password
            })
            .pipe(
                tap(response => {
                    localStorage.setItem(
                        "token",
                        response.data.token
                    );
                }),

                catchError(error => {
                    if (error.status === 401) {
                        this.errorMessage.set(
                            "Invalid email or password"
                        );
                    } else if (error.status === 500) {
                        this.errorMessage.set(
                            "Something went wrong. Please try again later."
                        );
                    } else {
                        this.errorMessage.set(
                            "Unable to login. Please try again."
                        );
                    }
                    return throwError(() => error);
                })
            );
    }
}

export default LoginService;
