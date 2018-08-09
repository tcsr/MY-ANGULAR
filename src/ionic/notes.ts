<div class="container-h items-center">
  <button ion-button icon-only color="secondary" *ngIf="needPagers" class="dir" (click)="prev()">
    <ion-icon name="ios-arrow-back"></ion-icon>
  </button>
  <ion-slides zoom="false" [slidesPerView]="numSlides" pager="true">
    <ion-slide class="slide-status" *ngFor="let item of analyzers">
      <div class="container-v gap carousel-item" (click)="statusDetails(item)">
        <div class="container-v items-center gap hero"
             [class.status-ok]="item.stat == 0"
             [class.status-warn]="item.stat == 1"
             [class.status-error]="item.stat == 2"
             [class.status-unknown]="item.stat > 2">
          <img class="thumbnail" src="{{item.ThumbnailImage}}"/>
          <h2 class="name">{{item.AnalyzerNickname}}</h2>
          <p class="serial">{{item.AnalyzerDetailName}}</p>
        </div>
        <div *ngIf="item.IsTempSerial == true" class="container-h gap status-row justify-center items-center">

        </div>
        <div *ngIf="item.IsTempSerial == false" class="container-h gap status-row justify-around">
          <div *ngFor="let statusItem of item.AnalyzerHealth"
               class="container-v justify-center items-center status-item">
            <p class="label">{{statusItem.Title}}</p>
            <div class="indicator"
                 [class.status-ok]="statusItem.stat == 0"
                 [class.status-warn]="statusItem.stat == 1"
                 [class.status-error]="statusItem.stat == 2"
                 [class.status-unknown]="statusItem.stat > 2"></div>
          </div>
        </div>
        <div class="container-h justify-center items-center item-actions">
          <button ion-button clear color="secondary">View</button>
        </div>
      </div>
    </ion-slide>
  </ion-slides>
  <button ion-button icon-only color="secondary" *ngIf="needPagers" class="dir" (click)="next()">
    <ion-icon name="ios-arrow-forward"></ion-icon>
  </button>
</div>


-------------

import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Slides } from 'ionic-angular';

import * as _ from 'lodash';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

/**
 * Generated class for the CarouselAnalyzersComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'carousel-analyzers',
  templateUrl: 'carousel-analyzers.html'
})
export class CarouselAnalyzersComponent implements OnInit, OnChanges {
  @ViewChild(Slides) slides: Slides;
  @Input() analyzers: any[];
  @Output() itemClick: EventEmitter<any> = new EventEmitter<any>();

  mediaQueries = [];
  numSlides = 3;
  index = 0;
  @Input() needPagers:boolean = false;

  swiperConfig = {
    loop: true,
    autoplay: 8000,
    spaceBetween: 16,
    loopedSlides: 0,

    autoplayDisableOnInteraction: true,
    longSwipesRatio: 0.25,
    paginationClickable: true,
    pagination: ".swiper-container .swiper-pagination",
    paginationType: 'custom',
    keyboardControl: true,
    mousewheelControl: true,
    paginationCustomRender: function (swiper, current, total) {
      return current + ' of ' + total;
    },
    slidesPerView: 3,
    slidesPerGroup: 3,
    spaceBetweenSlides: 16,
    breakpoints: {
      640: {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetweenSlides: 16
      },
      768: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetweenSlides: 16
      },
      1024: {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetweenSlides: 16
      },
      1800: {
        slidesPerView: 4,
        slidesPerGroup: 4,
        spaceBetweenSlides: 16
      },
      2000: {
        slidesPerView: 5,
        slidesPerGroup: 5,
        spaceBetweenSlides: 16
      },
      2800: {
        slidesPerView: 6,
        slidesPerGroup: 6,
        spaceBetweenSlides: 16
      }
    }
  };

  constructor(private analytics: AnalyticsProvider) {
    console.log('Hello CarouselAnalyzersComponent');
  }

  ngOnInit() {
    console.log('CarouselAnalyzersComponent: init');
    this.redraw();
  }

  ngOnChanges(changes:SimpleChanges){
    console.info('CarouselAnalyzersComponent:ngOnChanges')
    console.dir(changes);
    if(changes['analyzers'] && changes['analyzers'].currentValue) {
      let items = changes['analyzers'].currentValue;
      console.info('items', items, this.numSlides);
      this.needPagers = this.needPagers = ((items.length || 0) > this.numSlides);
    }
  }

  private redraw() {
    let smallQ = matchMedia('(max-width: 640px)');
    smallQ.addListener((evt) => {
      if (evt.matches) {
        console.info('matched: small');
        this.numSlides = 1;
        this.slides.update();
      }
    });

    let medQ = matchMedia('max-width: 768px)');
    medQ.addListener((evt) => {
      if (evt.matches) {
        console.info('matched: medium');
        this.numSlides = 2;
        this.slides.update();
      }

    });
    let largeQ = matchMedia('(min-width: 769px) and (max-width: 1024px)');
    largeQ.addListener((evt) => {
      if (evt.matches) {
        console.info('matched: large');
        this.numSlides = 3;
        this.slides.update();
      }
    });
    let xlargeQ = matchMedia('(min-width: 1025px)');
    xlargeQ.addListener((evt) => {
      if (evt.matches) {
        console.info('matched: xlarge');
        this.numSlides = 4;
        this.slides.update();
      }
    });
    let qs = [smallQ, medQ, largeQ, xlargeQ];
    let index = _.findIndex(qs, 'matches');
    console.info('index?', index);
    this.numSlides = index + 1;
    //if(this.slides && this.slides.length()) {
      //this.needPagers = this.slides.length() > this.numSlides;
    //}
  }

  next() {
    let cur = this.slides.getActiveIndex();
    console.log(this.numSlides, cur, this.slides.length());
    if ((cur + this.numSlides) >= this.slides.length()) {
      this.slides.slideTo(0);
    } else {
      this.slides.slideNext();
    }
    this.analytics.trackEvent('Content Interaction','Link Tracking', 'carousel analyzers > next');
  }

  prev() {
    let cur = this.slides.getActiveIndex();
    console.info('prev', cur, this.slides.length());
    if ((cur == 0) && this.slides.length() > 1) {
      this.slides.slideTo(this.slides.length() - this.numSlides)
    } else {
      this.slides.slidePrev();
    }
    this.analytics.trackEvent('Content Interaction','Link Tracking', 'carousel analyzers > previous');
  }

  statusDetails(item) {
    console.info('statusDetails', item);
    this.analytics.trackEvent('Content Interaction','Link Tracking', 'carousel analyzers > view >' + item.AnalyzerDetailName);
    this.itemClick.emit(item);
    // if(item && item.productID){
    //   this.nvc.push('analyzers', {productId:item.productID});
    // }
  }
}

------------------
