import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/profile/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  isText: boolean = false;
  type: string = 'password';
  eyeIcon: string = 'fa-eye';

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private router: Router,
    private toast: NgToastService,
    private userService: UserService){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin(){
    if(this.loginForm.valid){
      this.auth.login(this.loginForm.value)
      .subscribe({
        next:res => {
            this.auth.storeToken(res.token);
            
            const tokenPayload = this.auth.decodeToken();
            this.userService.setNameForProfile(tokenPayload.name);
            this.userService.setRoleForProfile(tokenPayload.role);

            this.toast.success({detail:"SUCCESS", summary: res.message, duration: 5000});
            this.loginForm.reset();
            this.router.navigate(['dashboard']);
        },
        error:err => {
          this.toast.error({detail:"ERROR", summary: err?.error.message, duration: 5000});
        }
      });  
    }
    else{
      ValidateForm.validateAllFormFields(this.loginForm);
    }
  }

  hideShowPass(){
    this.isText = !this.isText;
    this.isText ? this.type = 'text' : this.type = 'password';
    this.isText ? this.eyeIcon = 'fa-eye-slash' : this.eyeIcon = 'fa-eye';
  }
}
