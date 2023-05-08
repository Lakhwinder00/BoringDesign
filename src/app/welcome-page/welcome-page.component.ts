import { Component, OnInit } from '@angular/core';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent implements OnInit {
  constructor(private utilService: UtilService) {}

  ngOnInit(): void {
    console.clear();
    this.utilService.sendClickEvent(false);
  }
}
