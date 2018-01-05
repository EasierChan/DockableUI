
import { Message, BufferUtil } from "../app.model";

export enum COMS_MSG {
    kMtFQueryFund = 4003,
    kMtFQueryFundAns = 4004,
    kMtFQueryPosition = 4005,
    kMtFQueryPositionAns = 4006,
    kMtFSendOrder = 5001, // 下单
    kMtFSendOrderAns = 5002,
    kMtFCancelOrder = 5003, // 撤单
    kMtFCancelOrderAns = 5004,
    kMtFQueryOrder = 5005, // 查单
    kMtBQueryOrderAns = 5006,
    kMtFOrderPush = 5100 // 推送
}


export class QueryFund extends Message {
    static readonly len = 16;
    portfolio_id: number = 0;  // 8
    fund_account_id: number = 0;  // 8

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryFund.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;

        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l", this); // 大写为int 小写为uint
    }
}



export class QueryFundAns extends Message {
    static readonly len = 136;
    portfolio_id: number = 0;  // u8 allow nulls
    fund_account_id: number = 0; // u8 fund account id
    currency: number = 0;        // u4 RMB USD HKD GBP ...
    total_amt: number = 0;  // 8 总资金余额(当天交易不变)
    avl_amt: number = 0;    // 8 交易可用资金
    frozen_amt: number = 0; // 8交易冻结资金
    avl_financing_amt: number = 0;  // 8可用融资金额
    financing_amt: number = 0;     // 8 当前融资金额
    loan_amt: number = 0;          // 8 融券卖出负债
    total_margin: number = 0;     // 8 总保证金
    buy_margin: number = 0;       // 8 买保证金
    sell_margin: number = 0;      // 8 卖保证金
    fee: number = 0;              // 8 手续费
    position_pl: number = 0;      // 8 持仓盈亏
    close_pl: number = 0;         // 8 平仓盈亏
    mtm_position_pl: number = 0;  // 8 盯市持仓盈亏
    mtm_close_pl: number = 0;     // 8 盯市持仓盈亏

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryFundAns.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUInt32LE(this.currency, offset); offset += 4;
        offset += 4;
        buf.writeIntLE(this.total_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.avl_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.frozen_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.avl_financing_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.financing_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.loan_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.total_margin, offset, 8); offset += 8;
        buf.writeIntLE(this.buy_margin, offset, 8); offset += 8;
        buf.writeIntLE(this.sell_margin, offset, 8); offset += 8;
        buf.writeIntLE(this.fee, offset, 8); offset += 8;
        buf.writeIntLE(this.position_pl, offset, 8); offset += 8;
        buf.writeIntLE(this.close_pl, offset, 8); offset += 8;
        buf.writeIntLE(this.mtm_position_pl, offset, 8); offset += 8;
        buf.writeIntLE(this.mtm_close_pl, offset, 8); offset += 8;

        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l1i4p14L", this);
    }
}

export class QueryPosition extends Message {
    static len = 16;
    query_position: QueryFund = new QueryFund();

    fromBuffer(buf: Buffer, offset = 0) {
        offset = this.query_position.fromBuffer(buf, offset);
        return offset;
    }

    toBuffer(): Buffer {
        return this.query_position.toBuffer();
    }

}

export class QueryPositionAns extends Message {
    static readonly len = 184;
    portfolio_id: number = 0; // u8 allow nulls
    fund_account_id: number = 0; // u8
    trade_account_id: number = 0; // u8 trade account id
    ukey: number = 0; // u8
    sa_type: number = 0; // u4 0x01 0x02 0x04 0x08
    direction: number = 0; // u4 direction: long or short
    hedge_flag: number = 0;  // u4 投机套保标志：投机、套利、套保
    overnight_qty: number = 0; // 8 隔夜仓数量,用于还券等
    total_qty: number = 0;  // 8 总数量
    avl_qty: number = 0;    // 8 可用数量
    onway_qty: number = 0;  // 8 在途数量
    locked_avl_qty: number = 0;    // 8 锁定可用数量
    locked_onway_qty: number = 0;  // 8 锁定在途数量
    pending_buy_qty: number = 0;   // 8 挂买数量
    pending_buy_amt: number = 0; // 8
    pending_sell_qty: number = 0;  // 8 挂卖数量
    pending_sell_amt: number = 0; // 8
    today_open_qty: number = 0; // 8 今仓数量
    total_cost: number = 0;     // 8 总成本
    close_pl: number = 0;       // 8 平仓盈亏
    mtm_total_cost: number = 0; // 8 盯市总成本
    mtm_close_pl: number = 0;   // 8 盯市平仓盈亏
    avl_cre_redemp_qty: number = 0;    // 8 可申赎数量
    covered_frz_qty: number = 0;       // 8 备兑开仓冻结数量

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryFundAns.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trade_account_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.ukey, offset, 8); offset += 8;
        buf.writeUInt32LE(this.sa_type, offset); offset += 4;
        buf.writeUInt32LE(this.direction, offset); offset += 4;
        buf.writeUInt32LE(this.hedge_flag, offset); offset += 4;
        offset += 4;
        buf.writeIntLE(this.overnight_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.total_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.avl_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.onway_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.locked_avl_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.locked_onway_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.pending_buy_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.pending_buy_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.pending_sell_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.pending_sell_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.today_open_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.total_cost, offset, 8); offset += 8;
        buf.writeIntLE(this.close_pl, offset, 8); offset += 8;
        buf.writeIntLE(this.mtm_total_cost, offset, 8); offset += 8;
        buf.writeIntLE(this.mtm_close_pl, offset, 8); offset += 8;
        buf.writeIntLE(this.avl_cre_redemp_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.covered_frz_qty, offset, 8); offset += 8;

        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "4l3i4p17L", this);
    }
}

export class QueryOrder extends Message {
    static readonly len = 40;
    portfolio_id: number = 0;
    fund_account_id: number = 0;
    order_id: number = 0;
    order_ref: number = 0;
    term_id: number = 0;
    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryOrder.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.order_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "4l1i4p", this); // 大写为int 小写为uint
    }
}
export class OrderStatus extends Message {
    // QueryOrder; QueryOrderAns; SendOrderAns;
    static readonly len = 344;

    chronos_order: SendOrder = new SendOrder();

    order_id: number = 0;   // u8 订单ID
    cancelled_qty: number = 0;    // 8 已撤数量
    queued_qty: number = 0;       // 8 已确认？
    trade_qty: number = 0;        // 8 已成交数量
    trade_amt: number = 0;        // 8 已成交金额*10000（缺省值）
    trade_date: number = 0;      // u4 最后成交时间
    trade_time: number = 0;      // u4 最后成交时间
    approver_id: number = 0;     // u4 审批人ID
    status: number = 0;          // 4 订单状态
    ret_code: number = 0;        // 4
    broker_sn: string = "";    // 32 券商单号
    message: string = "";      // 128 附带消息，如错误消息等

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(OrderStatus.len, 0);
        this.chronos_order.toBuffer().copy(buf, offset); offset += 120;
        buf.writeUIntLE(this.order_id, offset, 8); offset += 8;
        buf.writeIntLE(this.cancelled_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.queued_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.trade_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.trade_amt, offset, 8); offset += 8;
        buf.writeUInt32LE(this.trade_date, offset); offset += 4;
        buf.writeUInt32LE(this.trade_time, offset); offset += 4;
        buf.writeUInt32LE(this.approver_id, offset); offset += 4;
        buf.writeInt32LE(this.status, offset); offset += 4;
        buf.writeInt32LE(this.ret_code, offset); offset += 4;
        buf.write(this.broker_sn, offset, 32); offset += 32;
        buf.write(this.message, offset, 128); offset += 128;
        offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        this.chronos_order.fromBuffer(buf, offset);
        return BufferUtil.format(buf, offset, "120o1l4L3i2I32s128s4p", this); // 大写为int 小写为uint
    }
}

export class QueryOrderAns extends Message {
    static len = 344;
    query_orderAns: OrderStatus = new OrderStatus();

    fromBuffer(buf: Buffer, offset = 0) {
        offset = this.query_orderAns.fromBuffer(buf, offset);
        return offset;
    }

    toBuffer(): Buffer {
        return this.query_orderAns.toBuffer();
    }

}

export class SendOrder extends Message {
    static readonly len = 120;
    order_ref: number = 0;   // u8  客户端订单ID+term_id = 唯一
    ukey: number = 0;        // u8  Universal Key
    directive: number = 0;   // u4 委托指令：普通买入，普通卖出
    offset_flag: number = 0; // u4 开平方向：开仓、平仓、平昨、平今
    hedge_flag: number = 0;  // u4 投机套保标志：投机、套利、套保
    execution: number = 0;   // u4 执行类型： 限价0，市价
    order_date: number = 0;  // u4 委托时间
    order_time: number = 0;  // u4 委托时间
    portfolio_id: number = 0;     // u8 组合ID
    fund_account_id: number = 0;  // u8 资金账户ID
    trade_account_id: number = 0; // u8 交易账户ID

    strategy_id: number = 0;     // u4 策略ID
    trader_id: number = 0;        // u4 交易员ID
    term_id: number = 0;          // u4 终端ID
    qty: number = 0;    // 8 委托数量
    price: number = 0;  // 8 委托价格
    property: number = 0;        // 4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
    currency: number = 0;        // 4 报价货币币种
    algor_id: number = 0;		// 8 策略算法ID
    reserve: number = 0;			// 4 预留(组合offset_flag)


    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(SendOrder.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.ukey, offset, 8); offset += 8;
        buf.writeUInt32LE(this.directive, offset); offset += 4;
        buf.writeUInt32LE(this.offset_flag, offset); offset += 4;
        buf.writeUInt32LE(this.hedge_flag, offset); offset += 4;
        buf.writeUInt32LE(this.execution, offset); offset += 4;
        buf.writeUInt32LE(this.order_date, offset); offset += 4;
        buf.writeUInt32LE(this.order_time, offset); offset += 4;
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trade_account_id, offset, 8); offset += 8;

        buf.writeUInt32LE(this.strategy_id, offset); offset += 4;
        buf.writeUInt32LE(this.trader_id, offset); offset += 4;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        offset += 4;
        buf.writeIntLE(this.qty, offset, 8); offset += 8;
        buf.writeIntLE(this.price, offset, 8); offset += 8;
        buf.writeInt32LE(this.property, offset); offset += 4;
        buf.writeInt32LE(this.currency, offset); offset += 4;
        buf.writeIntLE(this.algor_id, offset, 8); offset += 8;
        buf.writeInt32LE(this.reserve, offset); offset += 4;
        offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l6i3l3i4p2L2I1L1I4p", this); // 大写为int 小写为uint
    }
}

export class SendOrderAns extends OrderStatus {
    static len = 344;

    fromBuffer(buf: Buffer, offset = 0) {
        offset = super.fromBuffer(buf, offset);
        return offset;
    }

    toBuffer(): Buffer {
        return super.toBuffer();
    }

}

export class CancelOrder extends Message {
    static readonly len = 40;

    order_ref: number = 0;  // u8 撤单的客户端订单编号
    order_id: number = 0;   // u8 撤单订单编号
    trader_id: number = 0;  // u8 撤单交易员ID/交易账户id
    term_id: number = 0;    // u4 终端ID
    order_date: number = 0;  // u4 委托时间yymmdd
    order_time: number = 0; // u4 委托时间hhmmss

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(CancelOrder.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.order_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trader_id, offset, 8); offset += 8;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        offset += 4;
        buf.writeUInt32LE(this.order_date, offset); offset += 4;
        buf.writeUInt32LE(this.order_time, offset); offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "3l1i4p2i", this); // 大写为int 小写为uint
    }
}

export class CancelOrderAns extends Message {
    static readonly len = 176;

    order_ref: number = 0;  // u8 撤单的客户端订单编号
    order_id: number = 0;   // u8 撤单订单编号
    trader_id: number = 0;  // u8 撤单交易员ID/交易账户id
    term_id: number = 0;    // u4 终端ID
    order_date: number = 0;  // u4 委托时间yymmdd
    order_time: number = 0; // u4 委托时间hhmmss
    ret_code: number = 0; // 4
    ret_msg: string = ""; // 128

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(CancelOrderAns.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.order_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trader_id, offset, 8); offset += 8;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        offset += 4;
        buf.writeUInt32LE(this.order_date, offset); offset += 4;
        buf.writeUInt32LE(this.order_time, offset); offset += 4;
        buf.writeInt32LE(this.ret_code, offset); offset += 4;
        buf.write(this.ret_msg, offset, 128); offset += 128;
        offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "3l1i4p2i1I128s4p", this); // 大写为int 小写为uint
    }
}

export class OrderPush extends Message {
    static len = 480;

    order_status: OrderStatus = new OrderStatus(); // 344
    fund: QueryFundAns = new QueryFundAns(); // 136
    pos_count: number; // u4
    postions: Array<QueryPositionAns>; // 184

    fromBuffer(buf: Buffer, offset = 0) {
        offset = this.order_status.fromBuffer(buf, offset);
        offset = this.fund.fromBuffer(buf, offset);
        this.pos_count = buf.readUInt32LE(offset); offset += 4;
        this.postions = new Array<QueryPositionAns>();

        for (let i = 0; i < this.pos_count; ++i) {
            let pos = new QueryPositionAns();
            offset = pos.fromBuffer(buf, offset);
            this.postions.push(pos);
        }

        return offset;
    }

    toBuffer(): Buffer {
        let buf = Buffer.alloc(OrderStatus.len + QueryFundAns.len + 4 + QueryPositionAns.len * this.postions.length);
        return null;
    }
}

export class Peoduct extends Message {
    static readonly len = 16;
    portfolio_id: number = 0;  // 8
    fund_account_id: number = 0;  // 8

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryFund.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;

        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l", this); // 大写为int 小写为uint
    }
}
