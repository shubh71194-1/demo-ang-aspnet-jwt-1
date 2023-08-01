import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/profile/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  public users: any = [];

  public name: string = "";

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: NgToastService,
    private api: ApiService,
    private user: UserService
  ){}

  ngOnInit(): void {
    this.api.getUsers()
      .subscribe(res =>{
        this.users = res;
      });
    
      this.user.getNameFromProfile()
      .subscribe(val=>{
        this.name = this.auth.getNameFromToken();
      });
  }

  logout(){
    this.auth.logout();
    this.toast.success({
      detail:"SUCCESS",
      summary:"Logout Successfully!"
    });
    this.router.navigate(['login']);
  }
}
