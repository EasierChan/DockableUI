import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }     from "@angular/forms";

import { AppComponent }   from './app.component';
import { DockContainerComponent }   from 'controls/control';

@NgModule({
  imports:      [ 
    BrowserModule
    ],
  declarations: [
    AppComponent,
    DockContainerComponent 
    ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {
}