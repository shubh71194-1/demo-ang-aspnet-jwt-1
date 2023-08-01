import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private name$= new BehaviorSubject<string>("");
  private role$= new BehaviorSubject<string>("");

  constructor() { }

  public getRoleFromProfile(){
    return this.role$.asObservable();
  }

  public setRoleForProfile(role: string){
    this.role$.next(role);
  }

  public getNameFromProfile(){
    return this.name$.asObservable();
  }

  public setNameForProfile(name: string){
    this.role$.next(name);
  }
}
