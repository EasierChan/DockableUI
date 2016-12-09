import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }     from "@angular/forms";
import { CommonModule }   from '@angular/common';

import { AppComponent }   from './app.component';
import { DockContainerComponent }   from '../../base/controls/control';
import { DataTableComponent } from '../../base/controls/data.component';
import { UserControlComponent } from '../../base/controls/user.component';

@NgModule({
  imports:      [ 
    BrowserModule,
    CommonModule,
    FormsModule
    ],
  declarations: [
    AppComponent,
    DockContainerComponent,
    DataTableComponent,
    UserControlComponent
    ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {
}