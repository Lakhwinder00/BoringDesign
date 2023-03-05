import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
 isLogin:boolean=false;
  constructor(private router:Router,private utilService:UtilService) {
    this.utilService.getClickEvent().subscribe(() => {
    this.isLoginSession();
  }) 
  this.isLoginSession();
}

  ngOnInit(): void {
  }
  logout()
  {
    localStorage.removeItem('token')
    this.utilService.sendClickEvent();
    this.router.navigate(['/login']);
  }
  isLoginSession()
  {
    if(localStorage.getItem('token')==null)
    {
      this.isLogin=false;
      this.router.navigate(['/login']);
    }else{
      this.isLogin=true;
    }
  }
}
