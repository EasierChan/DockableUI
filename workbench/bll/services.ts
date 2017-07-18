"use strict";

import { Injectable } from "@angular/core";
import { IP20Service } from "../../base/api/services/ip20.service";

@Injectable()
export class TradeService extends IP20Service {
    constructor() {
        super();
    }
}

@Injectable()
export class QuoteService extends IP20Service {
    constructor() {
        super();
    }
}

@Injectable()
export class MockService extends IP20Service {
    constructor() {
        super();
    }
}