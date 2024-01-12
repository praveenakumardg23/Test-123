import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pre-order-meals',
  templateUrl: './pre-order-meals.page.html',
  styleUrls: ['./pre-order-meals.page.scss'],
})
export class PreOrderMealsPage implements OnInit {

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

}
