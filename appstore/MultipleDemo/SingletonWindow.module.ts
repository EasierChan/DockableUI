import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { SingletonWindowComponent } from "./SingletonWindow";
import { DockContainerComponent } from "../../base/controls/control";
import { DataTableComponent, EChartComponent } from "../../base/controls/data.component";
import { UserControlComponent } from "../../base/controls/user.component";

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    SingletonWindowComponent,
    DockContainerComponent,
    DataTableComponent,
    UserControlComponent,
    EChartComponent
  ],
  bootstrap: [SingletonWindowComponent]
})

export class AppModule {
}