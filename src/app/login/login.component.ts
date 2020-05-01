import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from '../shared/services/auth.service';
import { Store, select } from '@ngrx/store';
import { RootState, selectUser } from '../shared/store';
import { User } from '../shared/store/user/user.model';
import { UserService } from '../shared/services/user.service';
import { take } from 'rxjs/operators';
import { SetUser } from '../shared/store/user/user.action';


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
        private authService: AuthService,
        private store: Store<RootState>,
        private userService: UserService
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

            this.userService.getUser(res.user.uid).pipe(take(1)).subscribe(user => {
                user.id = res.user.uid;
                this.store.dispatch(new SetUser(user));
                localStorage.setItem('isLoggedin', 'true');
                this.router.navigate(['/dashboard']);
                this.loading = false;
            });


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
