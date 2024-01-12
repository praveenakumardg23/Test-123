import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { MessagePage } from './messages.page';
import { InboxComponent } from './inbox/inbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesMenuComponent } from './messages-menu/messages-menu.component';



const routes: Routes = [
  {
    path: '',
    component: MessagePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [MessagePage,InboxComponent, MessagesMenuComponent]
})
export class MessagesPageModule {}
