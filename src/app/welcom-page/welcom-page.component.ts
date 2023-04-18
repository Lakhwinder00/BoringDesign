import { Component, OnInit } from '@angular/core';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.scss'],
})
export class WelcomPageComponent implements OnInit {
  constructor(private utilService: UtilService) {}

  ngOnInit(): void {
    console.clear();
    this.utilService.sendClickEvent(false);
  }
}
