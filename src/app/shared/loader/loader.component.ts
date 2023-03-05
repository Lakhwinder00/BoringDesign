import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';


@Component({
  selector: 'app-loader',
  template:`<div class="loading" *ngIf="isloading"></div>`,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements  OnInit  {
  isloading: boolean = false;
  constructor(public loderService:LoaderService,private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.isloading=true;
    this.loderService.loading$.subscribe((val)=>{
      console.log('check')
      this.isloading=val;
      this.cdr.detectChanges();
    })
  }
 
}

