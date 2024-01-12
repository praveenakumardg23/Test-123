import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-badach-nsf-messages',
  templateUrl: './badach-nsf-messages.page.html',
  styleUrls: ['./badach-nsf-messages.page.scss'],
})
export class BadachNsfMessagesPage implements OnInit {
  message: string;
  type: string;
  cardNum: number;
  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.type = this.route.snapshot.queryParams['type'];
    this.cardNum = this.route.snapshot.queryParams['ccNum'];
  }

  ngOnInit() {}


  onBack(): void {
    this.authService.logout('logout');
  }

}
