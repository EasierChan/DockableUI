import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, ScrollerBarTable, EChartComponent } from "../../base/controls/data.component";
import { UserControlComponent, DockContainerComponent, StatusBarComponent, DialogComponent } from "../../base/controls/user.component";

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
    EChartComponent,
    UserControlComponent,
    StatusBarComponent,
    DialogComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}