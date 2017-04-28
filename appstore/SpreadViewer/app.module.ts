import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, EChartComponent, ScrollerBarTable } from "../../base/controls/data.component";
import { UserControlComponent, DockContainerComponent } from "../../base/controls/user.component";

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
    EChartComponent,
    ScrollerBarTable,
    UserControlComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}