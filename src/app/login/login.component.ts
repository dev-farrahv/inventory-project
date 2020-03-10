import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from '../shared/services/auth.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    email = '';
    password = '';
    loading = false;
    errorMsg: string;
    errorTimeout: any;
    constructor(
        public router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() { }

    onLoggedin() {
        if (this.email.trim() == '' || this.password.trim() == '') {
            return;
        }
        this.loading = true;
        const auth = {
            email: this.email,
            password: this.password
        };

        this.authService.doLogin(auth).then(res => {
            console.log(res);
            localStorage.setItem('isLoggedin', 'true');
            this.router.navigate(['/dashboard']);
            this.loading = false;

        }).catch(err => {
            clearTimeout(this.errorTimeout);
            this.loading = false;
            this.errorMsg = err;
            this.errorTimeout = setTimeout(() => {
                this.errorMsg = null;
            }, 3000);
        });
    }
}
