import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, ScrollerBarTable, EChartComponent } from "../../base/controls/data.component";
import { UserControlComponent, DockContainerComponent, StatusBarComponent, DialogComponent, ActionBarComponent } from "../../base/controls/user.component";
import { HomeComponent } from "./home/home.component";

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
    DialogComponent,
    ActionBarComponent,
    HomeComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}