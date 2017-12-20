import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, ScrollerBarTable, EChartComponent, EchartsDirective } from "../../base/controls/data.component";
import {
  UserControlComponent, DockContainerComponent, StatusBarComponent, DialogComponent, ActionBarComponent, CodeComponent,
  ButtonGroupComponent
} from "../../base/controls/user.component";
import { ProductComponent } from "./product/product";
import { StrategyComponent } from "./strategy/strategy";

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
    UserControlComponent,
    StatusBarComponent,
    DialogComponent,
    ActionBarComponent,
    EChartComponent,
    EchartsDirective,
    CodeComponent,
    ProductComponent,
    StrategyComponent,
    ButtonGroupComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}