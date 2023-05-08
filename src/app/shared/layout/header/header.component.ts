import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLogin: boolean = false;
  isLogo: boolean = true;
  constructor(private router: Router, private utilService: UtilService) {
    this.utilService.getClickEvent().subscribe((result) => {
      this.isLogo = result;
    });
  }
  ngOnInit(): void {}
}
