import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  public screenHeight: string | any;
  constructor() {}

  ngOnInit(): void {
    this.onWindowResize();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    // let getHeight= window.innerHeight-10;
    // this.screenHeight = getHeight+"px";
  }
}
