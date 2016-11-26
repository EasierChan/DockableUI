import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }     from "@angular/forms";
import { CommonModule }   from '@angular/common';

import { AppComponent }   from './app.component';
import { DockContainerComponent }   from 'controls/control';

@NgModule({
  imports:      [ 
    BrowserModule,
    CommonModule
    ],
  declarations: [
    AppComponent,
    DockContainerComponent 
    ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {
}