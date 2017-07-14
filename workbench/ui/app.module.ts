import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, ScrollerBarTable, EChartComponent } from "../../base/controls/data.component";
import { UserControlComponent2, DockContainerComponent, StatusBarComponent, DialogComponent, ActionBarComponent,
  TileAreaComponent } from "../../base/controls/user.component";
import { HomeComponent } from "./home/home.component";
import { AdminComponent } from "./home/admin.component";
import { DashboardComponent } from "./home/dash.component";
import { RiskComponent } from "./home/risk.component";
import { TradeComponent } from "./home/trade.component";
import { SimulationComponent } from "./home/simulation.component";
import { SecurityComponent } from "./security/security.component";
import { BacktestComponent } from "./home/backtest.component";

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    ActionBarComponent,
    ScrollerBarTable,
    UserControlComponent2,
    DataTableComponent,
    DockContainerComponent,
    EChartComponent,
    HomeComponent,
    AdminComponent,
    DashboardComponent,
    RiskComponent,
    TradeComponent,
    SimulationComponent,
    SecurityComponent,
    BacktestComponent,
    TileAreaComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}