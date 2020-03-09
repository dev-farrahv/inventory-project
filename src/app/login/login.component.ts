import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    username: string;
    password: string;
    constructor(
      public router: Router
    ) {}

    ngOnInit() {}

    onLoggedin() {
        console.log(this.username);
        console.log(this.password);
        if(this.username == 'admin' && this.password == 'admin'){
            this.router.navigate(['/dashboard']);
        }
        //localStorage.setItem('isLoggedin', 'true');
    }
}
