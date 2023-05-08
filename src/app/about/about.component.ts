import { Component, OnInit } from '@angular/core';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(private utilServices: UtilService) {}

  ngOnInit(): void {
    this.utilServices.sendClickEvent(true);
  }
}
