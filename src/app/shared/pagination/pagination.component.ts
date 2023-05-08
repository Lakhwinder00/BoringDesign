import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input() pageIndex: number | any; // current offset
  @Input() limit: number | any; // record per page
  @Input() total: number | any; // total records
  @Input() range: number = 1;
  @Input() changeDefaultPage: number | any;
  @Input() changeStartPage: number | any;
  @Output() pageChange: EventEmitter<any>;
  totalPageNo: number[];
  totalSizeOfPages: number;
  startPage: number = 0;
  pageIndexNumberSize: number = 1;
  defaultPage: number = 0;
  constructor() {
    this.totalSizeOfPages = 0;
    this.totalPageNo = [];
    this.pageChange = new EventEmitter<any>();
  }

  ngOnInit(): void {
    this.defaultPage = this.pageIndexNumberSize;
  }
  ngOnChanges() {
    if (
      this.changeDefaultPage != undefined &&
      this.changeStartPage != undefined
    ) {
      this.defaultPage = this.changeDefaultPage;
      this.startPage = this.changeStartPage;
    }
    this.totalSizeOfPages = this.total / this.limit;
    this.totalSizeOfPages = Math.ceil(this.totalSizeOfPages);

    this.totalPageNo = [];
    for (let i = 1; i <= this.totalSizeOfPages; i++) {
      this.totalPageNo.push(i);
    }
  }

  pageChangeBackward() {
    if (this.pageIndex == this.startPage + 1) {
      this.startPage = this.pageIndex - this.pageIndexNumberSize - 1;
      this.defaultPage = this.defaultPage - this.pageIndexNumberSize;
    }
    if (this.pageIndex > 0) this.pageIndex = this.pageIndex - 1;
    this.pageChange.emit(this.pageIndex);
  }

  pageChangeIndex(index: number) {
    this.pageIndex = index;
    let pageNo = this.defaultPage - index;
    if (index > this.defaultPage) {
      this.startPage = index - 1;
      this.defaultPage = index - 1 + this.pageIndexNumberSize;
    } else if (this.defaultPage >= index) {
    } else {
      this.defaultPage =
        this.defaultPage > index
          ? this.defaultPage - this.pageIndexNumberSize
          : index + pageNo;
      this.startPage =
        this.defaultPage > this.pageIndexNumberSize
          ? this.defaultPage - this.pageIndexNumberSize
          : 0;
    }

    this.pageChange.emit(this.pageIndex == 0 ? 1 : this.pageIndex);
  }
  startPageChangeIndex(index: number) {
    this.defaultPage = this.pageIndexNumberSize;
    this.startPage = 0;
    this.pageIndex = 1;
    this.pageChange.emit(this.pageIndex == 0 ? 1 : this.pageIndex);
  }
  lastChangeIndex(index: number) {
    this.pageIndex = index;
    this.defaultPage = index;
    this.startPage = index - this.pageIndexNumberSize;
    this.pageChange.emit(this.pageIndex == 0 ? 1 : this.pageIndex);
  }
  prevChangeIndex(index: number) {
    this.pageIndex = index;
    let pageNo = this.defaultPage - index;
    this.defaultPage =
      this.defaultPage > index
        ? this.defaultPage - this.pageIndexNumberSize
        : index + pageNo;
    this.startPage =
      this.defaultPage > this.pageIndexNumberSize
        ? this.defaultPage - this.pageIndexNumberSize
        : 0;
    this.pageChange.emit(index == 0 ? 1 : index);
  }

  pageChangeForward() {
    if (this.pageIndex < this.totalSizeOfPages)
      this.pageIndex = this.pageIndex + 1;
    if (this.pageIndex > this.defaultPage) {
      this.startPage = this.pageIndex - 1;
      this.defaultPage = this.pageIndex - 1 + this.pageIndexNumberSize;
    }
    this.pageChange.emit(this.pageIndex == 0 ? 1 : this.pageIndex);
  }
}
