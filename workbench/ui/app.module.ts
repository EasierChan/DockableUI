import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { CommonModule, PercentPipe } from "@angular/common";

import { AppComponent } from "./app.component";
import { DataTableComponent, ScrollerBarTable, EChartComponent, DataTable2 } from "../../base/controls/data.component";
import {
  UserControlComponent, DockContainerComponent, StatusBarComponent, DialogComponent, ActionBarComponent,
  TileAreaComponent, CodeComponent, ButtonGroupComponent, VBoxDirective
} from "../../base/controls/user.component";
import { HomeComponent } from "./home/home.component";
import { AdminComponent } from "./home/admin.component";
import { DashboardComponent } from "./home/dash.component";
import { RiskComponent } from "./home/risk.component";
import { TradeComponent } from "./home/trade.component";
import { SimulationComponent } from "./home/simulation.component";
import { SecurityComponent } from "./security/security.component";
import { BacktestComponent } from "./home/backtest.component";
import { SettingComponent } from "./system/setting";
import { UserComponent } from "./system/user";
import { SupportComponent } from "./system/support";
import {
  FactorProfitComponent, FactorAnalysisComponent,
  FactorAlphaComponent, AIBrandComponent
} from "./home/riskfactor.component";
import { ReportComponent } from "./home/report.component";
import { AnalysisComponent } from "./home/analysis";
import { ProductsComponent } from "./home/product.component";
import { BasketComponent } from "./home/basket.component";
import { EchartsDirective } from "./app.controls";
import { SimQueryComponent } from "./home/simquery.component";

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    DialogComponent,
    VBoxDirective,
    ActionBarComponent,
    ScrollerBarTable,
    UserControlComponent,
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
    TileAreaComponent,
    SettingComponent,
    UserComponent,
    FactorProfitComponent,
    FactorAnalysisComponent,
    FactorAlphaComponent,
    AIBrandComponent,
    SupportComponent,
    EchartsDirective,
    ReportComponent,
    CodeComponent,
    ButtonGroupComponent,
    AnalysisComponent,
    ProductsComponent,
    BasketComponent,
    SimQueryComponent,
    DataTable2
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}