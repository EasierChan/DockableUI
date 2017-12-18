
import { Message, BufferUtil } from "../app.model";

export enum COMS_MSG {
    kMtFQueryFund = 4003,
    kMtFQueryFundAns = 4004,
    kMtFQueryPosition = 4005,
    kMtFQueryPositionAns = 4006,
    kMtFSendOrder = 5001,//下单
    kMtFSendOrderAns = 5002,
    kMtFCancelOrder = 5003,//撤单
    kMtFCancelOrderAns = 5004,
    kMtFQueryOrder = 5005,//查单
    kMtBQueryOrderAns = 5006
}


export class QueryFundAndPosition extends Message {
    static readonly len = 16;
    portfolio_id: number = 0;  // 8
    fund_account_id: number = 0;  // 8

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryFundAndPosition.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;

        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l", this);//大写为int 小写为uint
    }
};

export class QueryFundAns extends Message {
    static readonly len = 132;
    portfolio_id: number = 0;  //u8 allow nulls
    fund_account_id: number = 0; //u8 fund account id
    currency: number = 0;        //u4 RMB USD HKD GBP ...
    total_amt: number = 0;  //8 总资金余额(当天交易不变)
    avl_amt: number = 0;    //8 交易可用资金
    frozen_amt: number = 0; // 8交易冻结资金
    avl_financing_amt: number = 0;  //8可用融资金额
    financing_amt: number = 0;     //8 当前融资金额
    loan_amt: number = 0;          //8 融券卖出负债
    total_margin: number = 0;     //8 总保证金
    buy_margin: number = 0;       //8 买保证金
    sell_margin: number = 0;      //8 卖保证金
    fee: number = 0;              //8 手续费
    position_pl: number = 0;      //8 持仓盈亏
    close_pl: number = 0;         //8 平仓盈亏
    mtm_position_pl: number = 0;  //8 盯市持仓盈亏
    mtm_close_pl: number = 0;     //8 盯市持仓盈亏

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(QueryFundAns.len, 0);
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUInt32LE(this.currency, offset); offset += 4;
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
        return BufferUtil.format(buf, offset, "2l1i14L", this);
    }
}

export class QueryPositionAns extends Message {
    static readonly len = 180;
    portfolio_id: number = 0; // u8 allow nulls
    fund_account_id: number = 0; //u8
    trade_account_id: number = 0; //u8 trade account id
    ukey: number = 0; //u8
    sa_type: number = 0; //u4 0x01 0x02 0x04 0x08
    direction: number = 0; //u4 direction: long or short
    hedge_flag: number = 0;  //u4 投机套保标志：投机、套利、套保
    overnight_qty: number = 0; //8 隔夜仓数量,用于还券等
    total_qty: number = 0;  //8 总数量
    avl_qty: number = 0;    //8 可用数量
    onway_qty: number = 0;  //8 在途数量
    locked_avl_qty: number = 0;    //8 锁定可用数量
    locked_onway_qty: number = 0;  //8 锁定在途数量
    pending_buy_qty: number = 0;   //8 挂买数量
    pending_buy_amt: number = 0; //8
    pending_sell_qty: number = 0;  //8 挂卖数量
    pending_sell_amt: number = 0;//8
    today_open_qty: number = 0; //8 今仓数量
    total_cost: number = 0;     //8 总成本
    close_pl: number = 0;       //8 平仓盈亏
    mtm_total_cost: number = 0; //8 盯市总成本
    mtm_close_pl: number = 0;   //8 盯市平仓盈亏
    avl_cre_redemp_qty: number = 0;    //8 可申赎数量
    covered_frz_qty: number = 0;       //8 备兑开仓冻结数量

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
        return BufferUtil.format(buf, offset, "4l3i17L", this);
    }
}


export class SendOrder extends Message {
    static readonly len = 112;

    order_ref: number = 0;   //u8  客户端订单ID+term_id = 唯一
    ukey: number = 0;        //u8  Universal Key
    directive: number = 0;   //u4 委托指令：普通买入，普通卖出
    offset_flag: number = 0; //u4 开平方向：开仓、平仓、平昨、平今
    hedge_flag: number = 0;  //u4 投机套保标志：投机、套利、套保
    execution: number = 0;   //u4 执行类型： 限价0，市价
    order_time: number = 0;  //u8 委托时间
    portfolio_id: number = 0;     //u8 组合ID
    fund_account_id: number = 0;  //u8 资金账户ID
    trade_account_id: number = 0; //u8 交易账户ID

    strategy_id: number = 0;     //u4 策略ID
    trader_id: number = 0;        //u4 交易员ID
    term_id: number = 0;          //u4 终端ID
    qty: number = 0;    //8 委托数量
    price: number = 0;  //8 委托价格
    property: number = 0;        //4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
    currency: number = 0;        //4 报价货币币种
    algor_id: number = 0;		//8 策略算法ID
    reserve: number = 0;			//4 预留(组合offset_flag)


    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(SendOrder.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.ukey, offset, 8); offset += 8;
        buf.writeUInt32LE(this.directive, offset); offset += 4;
        buf.writeUInt32LE(this.offset_flag, offset); offset += 4;
        buf.writeUInt32LE(this.hedge_flag, offset); offset += 4;
        buf.writeUInt32LE(this.execution, offset); offset += 4;
        buf.writeUIntLE(this.order_time, offset, 8); offset += 8;
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trade_account_id, offset, 8); offset += 8;

        buf.writeUInt32LE(this.strategy_id, offset); offset += 4;
        buf.writeUInt32LE(this.trader_id, offset); offset += 4;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        buf.writeIntLE(this.qty, offset, 8); offset += 8;
        buf.writeIntLE(this.price, offset, 8); offset += 8;
        buf.writeInt32LE(this.property, offset); offset += 4;
        buf.writeInt32LE(this.currency, offset); offset += 4;
        buf.writeIntLE(this.algor_id, offset, 8); offset += 8;
        buf.writeInt32LE(this.reserve, offset); offset += 4;

        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l4i4l3i2L2I1L1I", this);//大写为int 小写为uint
    }
};


export class OrderStatus extends Message {
    //QueryOrder; QueryOrderAns; SendOrderAns;
    static readonly len = 172;

    order_ref: number = 0;   //u8  客户端订单ID+term_id = 唯一
    ukey: number = 0;        //u8  Universal Key
    directive: number = 0;   //u4 委托指令：普通买入，普通卖出
    offset_flag: number = 0; //u4 开平方向：开仓、平仓、平昨、平今
    hedge_flag: number = 0;  //u4 投机套保标志：投机、套利、套保
    execution: number = 0;   //u4 执行类型： 限价0，市价
    order_time: number = 0;  //u8 委托时间
    portfolio_id: number = 0;     //u8 组合ID
    fund_account_id: number = 0;  //u8 资金账户ID
    trade_account_id: number = 0; //u8 交易账户ID

    strategy_id: number = 0;     //u4 策略ID
    trader_id: number = 0;        //u4 交易员ID
    term_id: number = 0;          //u4 终端ID
    qty: number = 0;    //8 委托数量
    price: number = 0;  //8 委托价格
    property: number = 0;        //4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
    currency: number = 0;        //4 报价货币币种
    algor_id: number = 0;		//8 策略算法ID
    reserve: number = 0;			//4 预留(组合offset_flag)
    order_id: number = 0;   //8 订单ID

    cancelled_qty: number = 0;    //8 已撤数量
    queued_qty: number = 0;       //8 已确认？
    trade_qty: number = 0;        //8 已成交数量
    trade_amt: number = 0;        //8 已成交金额*10000（缺省值）
    trade_time: number = 0;      //8 最后成交时间
    approver_id: number = 0;     //4 审批人ID
    status: number = 0;          //4 订单状态
    ret_code: number = 0;        //4
    broker_sn: string = "";    //32 券商单号
    message: string = "";      //128 附带消息，如错误消息等

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(OrderStatus.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.ukey, offset, 8); offset += 8;
        buf.writeUInt32LE(this.directive, offset); offset += 4;
        buf.writeUInt32LE(this.offset_flag, offset); offset += 4;
        buf.writeUInt32LE(this.hedge_flag, offset); offset += 4;
        buf.writeUInt32LE(this.execution, offset); offset += 4;
        buf.writeUIntLE(this.order_time, offset, 8); offset += 8;
        buf.writeUIntLE(this.portfolio_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.fund_account_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trade_account_id, offset, 8); offset += 8;

        buf.writeUInt32LE(this.strategy_id, offset); offset += 4;
        buf.writeUInt32LE(this.trader_id, offset); offset += 4;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        buf.writeIntLE(this.qty, offset, 8); offset += 8;
        buf.writeIntLE(this.price, offset, 8); offset += 8;
        buf.writeInt32LE(this.property, offset); offset += 4;
        buf.writeInt32LE(this.currency, offset); offset += 4;
        buf.writeIntLE(this.algor_id, offset, 8); offset += 8;
        buf.writeInt32LE(this.reserve, offset); offset += 4;
        buf.writeIntLE(this.order_id, offset, 8); offset += 8;

        buf.writeIntLE(this.cancelled_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.queued_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.trade_qty, offset, 8); offset += 8;
        buf.writeIntLE(this.trade_amt, offset, 8); offset += 8;
        buf.writeIntLE(this.trade_time, offset, 8); offset += 8;
        buf.writeInt32LE(this.approver_id, offset); offset += 4;
        buf.writeInt32LE(this.status, offset); offset += 4;
        buf.writeInt32LE(this.ret_code, offset); offset += 4;
        buf.write(this.broker_sn, offset, 32); offset += 32;
        buf.write(this.message, offset, 128); offset += 128;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2l4i4l3i2L2I1L1I6L3I160s", this);//大写为int 小写为uint
    }
};

export class CancelOrder extends Message {
    static readonly len = 36;

    order_ref: number = 0;  //u8 撤单的客户端订单编号
    order_id: number = 0;   //u8 撤单订单编号
    trader_id: number = 0;  //u8 撤单交易员ID/交易账户id
    term_id: number = 0;    //u4 终端ID
    order_time: number = 0; //u8 撤单时间

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(CancelOrder.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.order_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trader_id, offset, 8); offset += 8;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        buf.writeUIntLE(this.order_time, offset, 8); offset += 8;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "3l1i1l", this);//大写为int 小写为uint
    }
};

export class CancelOrderAns extends Message {
    static readonly len = 168;

    order_ref: number = 0;  //u8 撤单的客户端订单编号
    order_id: number = 0;   //u8 撤单订单编号
    trader_id: number = 0;  //u8 撤单交易员ID/交易账户id
    term_id: number = 0;    //u4 终端ID
    order_time: number = 0; //u8 撤单时间
    ret_code: number = 0; // 4
    ret_msg: string = "";; // 128

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(CancelOrderAns.len, 0);
        buf.writeUIntLE(this.order_ref, offset, 8); offset += 8;
        buf.writeUIntLE(this.order_id, offset, 8); offset += 8;
        buf.writeUIntLE(this.trader_id, offset, 8); offset += 8;
        buf.writeUInt32LE(this.term_id, offset); offset += 4;
        buf.writeUIntLE(this.order_time, offset, 8); offset += 8;
        buf.writeInt32LE(this.ret_code, offset); offset += 4;
        buf.write(this.ret_msg, offset, 128); offset += 128;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "3l1i1l1I128s", this);//大写为int 小写为uint
    }
};
