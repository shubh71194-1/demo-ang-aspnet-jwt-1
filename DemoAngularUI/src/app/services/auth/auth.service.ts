import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = "https://localhost:7170/api/User/";

  private payload: any;

  constructor(
    private http: HttpClient) 
    { 
      this.payload = this.decodeToken();
    }

  signUp(userObj: any){
    return this.http.post<any>(`${this.baseUrl}register`, userObj);
  }

  login(userObj: any){
    return this.http.post<any>(`${this.baseUrl}authenticate`, userObj);
  }

  logout(){
    localStorage.clear();
  }

  storeToken(tokenValue: string){
    localStorage.setItem('token',tokenValue);
  }

  getToken(){
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean{
    return !!this.getToken();
  }

  decodeToken(){
    const jwt = new JwtHelperService();
    return jwt.decodeToken(this.getToken()!);
  }

  getNameFromToken(){
    if(this.payload)
      return this.payload.name;
  }

  getRoleFromToken(){
    if(this.payload)
      return this.payload.role;
  }
}
