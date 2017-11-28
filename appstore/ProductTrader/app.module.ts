import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, ScrollerBarTable, EchartsDirective } from "../../base/controls/data.component";
import { UserControlComponent, DockContainerComponent, StatusBarComponent, DialogComponent, ActionBarComponent } from "../../base/controls/user.component";

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    DockContainerComponent,
    DataTableComponent,
    ScrollerBarTable,
    EchartsDirective,
    UserControlComponent,
    ActionBarComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}