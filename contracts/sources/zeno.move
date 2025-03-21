module zeno::zeno;

use std::string::String;
use std::type_name::{Self, TypeName};
use sui::bag::{Self, Bag};
use sui::balance::Balance;
use sui::clock::Clock;
use sui::coin::Coin;
use sui::event;
use sui::table::{Self, Table};
use sui::vec_map::{Self, VecMap};

const MIST: u64 = 1_000_000_000;

// --- ERRORS ---

const E_INVALID_COLLATERAL_TYPE: u64 = 0;
const E_INSUFFICIENT_COLLATERAL: u64 = 1;
const E_AMOUNT_LEFT_NOT_ENOUGH: u64 = 2;
const E_MARKET_PAUSED: u64 = 3;
const E_MARKET_DELIVERY_TIME_PAST: u64 = 4;
const E_INVALID_ORDER_OWNER: u64 = 5;
const E_TOO_MUCH_COLLATERAL: u64 = 6;
const E_INVALID_SETTLED_BY: u64 = 7;
const E_MARKET_NOT_RESOLVED: u64 = 8;
const E_INVALID_FINAL_COIN_AMOUNT: u64 = 9;
const E_INVALID_FINAL_COIN_TYPE: u64 = 10;
const E_INVALID_CLAIMER: u64 = 11;
const E_MARKET_DELIVERY_TIME_NOT_PAST: u64 = 12;
const E_SETTLEMENT_TIME_PAST: u64 = 13;
// --- TYPES ---

public struct Order<phantom T> has key, store {
    id: UID,
    market_id: ID,
    is_buy: bool,
    collateral: Balance<T>,
    filled_collateral: u64, // 0 if not partially filled
    /// rate of how many collateral per coin in mist (9 decimals)
    /// ---
    /// 1_000_000_000 = 1 collateral per 1 final coin
    /// 10_000_000_000 = 10 collateral per 1 final coin
    /// 100_000_000 = 0.1 collateral per 1 final coin
    rate: u64,
    created_at: u64,
    can_partially_fill: bool, // if set, the order will can be partially filled
    by: address,
}

public struct FilledOrder<phantom T> has key, store {
    id: UID,
    market_id: ID,
    is_buy: bool,
    maker: address,
    taker: address,
    maker_collateral: Balance<T>,
    taker_collateral: Balance<T>,
    /// rate of how many collateral per coin in mist (9 decimals)
    /// ---
    /// 1_000_000_000 = 1 collateral per 1 coin
    /// 10_000_000_000 = 10 collateral per 1 coin
    /// 100_000_000 = 0.1 collateral per 1 coin
    rate: u64,
    created_at: u64,
    filled_at: u64,
}

public struct SettledOrder<phantom C> has key, store {
    id: UID,
    claimer: address,
    balance: Balance<C>,
    settled_at: u64,
}

public struct Collateral has copy, drop, store {
    coin_type: TypeName,
    minimum_amount: u64,
}

/// Represents a premarket for a specific coin
public struct PreMarket has key, store {
    id: UID,
    label: String,
    resolution: Option<Resolution>,
    collateral_types: VecMap<TypeName, Collateral>,
    created_at: u64,
    settle_fee_rate_bps: u64, // settle fee rate in basis points: 100 = 1%
    buy_fee_rate_bps: u64, // buy fee rate in basis points: 100 = 1%
    cancel_fee_rate_bps: u64, // cancel fee rate in basis points: 100 = 1%
    penalty_fee_rate_bps: u64, // penalty rate in basis points: 100 = 1%
    fee_addr: address,
    is_paused: bool, // no new orders or fills can be created, but existing orders can be closed and settled
    orders: Bag,
    filled_orders: Bag,
    settled_orders: Bag,
}

public struct OrderOwnerTable has key, store {
    id: UID,
    owners: Table<address, OrderOwnerCap>,
}

/// Resolution information when the premarket is resolved
#[allow(unused_field)]
public struct Resolution has copy, drop, store {
    resolved_at: u64,
    settlement_start: u64,
    delivery_before: u64,
    coin_type: TypeName,
    /// decimal adjustment difference between the collateral and the coin in mist (9 decimals)
    /// 1_000_000_000 = no change
    /// 10_000_000_000 = add 1 decimal point to the coin
    /// 100_000_000 = remove 1 decimal point from the coin
    rate: u64,
}

/// Admin capability for managing premarkets
public struct PremarketAdminCap has key, store {
    id: UID,
}

/// Order owner capability, use to manage orders and filled orders
public struct OrderOwnerCap has key, store {
    id: UID,
    order_ids: Table<ID, bool>,
    filled_order_ids: Table<ID, bool>,
    settled_order_ids: Table<ID, bool>,
}

// --- EVENTS ---

public struct PremarketCreated has copy, drop, store {
    market_id: ID,
}

public struct OrderCreated has copy, drop, store {
    market_id: ID,
    order_id: ID,
    is_buy: bool,
    can_partially_fill: bool,
    rate: u64,
    collateral_amount: u64,
    collateral_type: TypeName,
}

public struct OrderFilled has copy, drop, store {
    market_id: ID,
    order_id: ID,
    filled_order_id: ID,
    rate: u64,
    maker_collateral_amount_left: u64,
    collateral_amount: u64,
    collateral_type: TypeName,
}

public struct OrderCancelled has copy, drop, store {
    market_id: ID,
    order_id: ID,
}

public struct OrderSettled has copy, drop, store {
    market_id: ID,
    filled_order_id: ID,
    settled_order_id: ID,
}

public struct OrderClaimed has copy, drop, store {
    market_id: ID,
    settled_order_id: ID,
}

public struct OrderClosed has copy, drop, store {
    market_id: ID,
    filled_order_id: ID,
}

// --- INIT ---

fun init(ctx: &mut TxContext) {
    let admin_cap = PremarketAdminCap {
        id: object::new(ctx),
    };

    transfer::transfer(admin_cap, ctx.sender());

    let order_owner_table = OrderOwnerTable {
        id: object::new(ctx),
        owners: table::new(ctx),
    };

    transfer::share_object(order_owner_table);
}

// --- FUNCTIONS ---

public fun create_premarket(
    _: &PremarketAdminCap,
    label: String,
    settle_fee_rate_bps: u64,
    buy_fee_rate_bps: u64,
    cancel_fee_rate_bps: u64,
    penalty_fee_rate_bps: u64,
    fee_addr: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let premarket = PreMarket {
        id: object::new(ctx),
        label,
        resolution: option::none(),
        collateral_types: vec_map::empty(),
        settle_fee_rate_bps,
        buy_fee_rate_bps,
        cancel_fee_rate_bps,
        penalty_fee_rate_bps,
        fee_addr,
        created_at: clock.timestamp_ms(),
        is_paused: false,
        orders: bag::new(ctx),
        filled_orders: bag::new(ctx),
        settled_orders: bag::new(ctx),
    };

    event::emit(PremarketCreated {
        market_id: object::id(&premarket),
    });
    transfer::share_object(premarket);
}

public fun pause(_: &PremarketAdminCap, market: &mut PreMarket) {
    market.is_paused = true;
}

public fun unpause(_: &PremarketAdminCap, market: &mut PreMarket) {
    market.is_paused = false;
}

public fun register_order_owner(
    table: &mut Table<address, OrderOwnerCap>,
    addr: address,
    ctx: &mut TxContext,
) {
    if (!table.contains(addr)) {
        table::add(
            table,
            addr,
            OrderOwnerCap {
                id: object::new(ctx),
                order_ids: table::new(ctx),
                filled_order_ids: table::new(ctx),
                settled_order_ids: table::new(ctx),
            },
        );
    }
}

public enum ModifyOrderType has copy, drop {
    Order,
    FilledOrder,
    SettledOrder,
}

public fun modify_order_owner(
    table: &mut Table<address, OrderOwnerCap>,
    order_id: ID,
    modify_order_type: ModifyOrderType,
    is_add: bool,
    addr: address,
    _ctx: &mut TxContext,
) {
    let owner_cap = table::borrow_mut(table, addr);
    if (is_add) {
        match (modify_order_type) {
            ModifyOrderType::Order => {
                table::add(&mut owner_cap.order_ids, order_id, true);
            },
            ModifyOrderType::FilledOrder => {
                table::add(&mut owner_cap.filled_order_ids, order_id, true);
            },
            ModifyOrderType::SettledOrder => {
                table::add(&mut owner_cap.settled_order_ids, order_id, true);
            },
        }
    } else {
        match (modify_order_type) {
            ModifyOrderType::Order => {
                table::remove(&mut owner_cap.order_ids, order_id);
            },
            ModifyOrderType::FilledOrder => {
                table::remove(&mut owner_cap.filled_order_ids, order_id);
            },
            ModifyOrderType::SettledOrder => {
                table::remove(&mut owner_cap.settled_order_ids, order_id);
            },
        }
    }
}

public fun set_collateral_type<T>(
    _: &PremarketAdminCap,
    market: &mut PreMarket,
    minimum_amount: u64,
) {
    let coin_type = type_name::get<T>();
    let collateral = Collateral {
        coin_type,
        minimum_amount,
    };

    vec_map::insert(&mut market.collateral_types, coin_type, collateral);
}

public fun remove_collateral_type<T>(_: &PremarketAdminCap, market: &mut PreMarket) {
    let coin_type = type_name::get<T>();
    vec_map::remove(&mut market.collateral_types, &coin_type);
}

public fun set_resolution<C>(
    _: &PremarketAdminCap,
    market: &mut PreMarket,
    settlement_start: u64,
    delivery_before: u64,
    rate: u64,
    clock: &Clock,
) {
    let resolution = Resolution {
        resolved_at: clock.timestamp_ms(),
        settlement_start,
        delivery_before,
        coin_type: type_name::get<C>(),
        rate,
    };

    market.resolution.swap_or_fill(resolution);
}

// --- PUBLIC FUNCTIONS ---

public fun create_order<T>(
    market: &mut PreMarket,
    order_owner_table: &mut OrderOwnerTable,
    is_buy: bool,
    collateral: Coin<T>,
    rate: u64,
    can_partially_fill: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    // check market is not paused
    assert!(!market.is_paused, E_MARKET_PAUSED);

    if (market.resolution.is_some()) {
        let resolution = market.resolution.borrow();
        // check if settlement start time is past
        assert!(clock.timestamp_ms() <= resolution.settlement_start, E_SETTLEMENT_TIME_PAST);
    };

    // check collateral type
    let collateral_type = type_name::get<T>();
    let collateral_type_info = vec_map::try_get(&market.collateral_types, &collateral_type);
    assert!(collateral_type_info.is_some(), E_INVALID_COLLATERAL_TYPE);
    // check collateral amount
    assert!(
        collateral_type_info.borrow().minimum_amount <= collateral.value(),
        E_INSUFFICIENT_COLLATERAL,
    );

    let order_id = object::new(ctx);

    event::emit(OrderCreated {
        market_id: object::id(market),
        order_id: *order_id.as_inner(),
        is_buy,
        can_partially_fill,
        rate,
        collateral_amount: collateral.value(),
        collateral_type,
    });

    // create order
    let order = Order<T> {
        id: order_id,
        market_id: object::id(market),
        is_buy,
        collateral: collateral.into_balance(),
        rate,
        can_partially_fill,
        filled_collateral: 0,
        created_at: clock.timestamp_ms(),
        by: ctx.sender(),
    };

    register_order_owner(&mut order_owner_table.owners, ctx.sender(), ctx);
    modify_order_owner(
        &mut order_owner_table.owners,
        object::id(&order),
        ModifyOrderType::Order,
        true,
        ctx.sender(),
        ctx,
    );

    market.orders.add(object::id(&order), order);
}

public fun cancel_order<T>(
    premarket: &mut PreMarket,
    order_owner_table: &mut OrderOwnerTable,
    order_id: ID,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<T> {
    let Order { id, mut collateral, .. } = bag::remove(
        &mut premarket.orders,
        order_id,
    );

    // check order id
    assert!(id.as_inner() == order_id, E_INVALID_ORDER_OWNER);

    event::emit(OrderCancelled {
        market_id: object::id(premarket),
        order_id,
    });

    modify_order_owner(
        &mut order_owner_table.owners,
        order_id,
        ModifyOrderType::Order,
        false,
        ctx.sender(),
        ctx,
    );
    object::delete(id);

    // if cancel before delivery time, charge cancel fee
    if (
        premarket
            .resolution
            .map_ref!(|m| clock.timestamp_ms() <= m.delivery_before)
            .get_with_default(false)
    ) {
        let fee_value = collateral.value() * premarket.cancel_fee_rate_bps / 10_000;
        let fee_coin = collateral.split(fee_value).into_coin(ctx);
        transfer::public_transfer(fee_coin, premarket.fee_addr);
    };

    collateral.into_coin(ctx)
}

public fun fill_order<T>(
    market: &mut PreMarket,
    order_owner_table: &mut OrderOwnerTable,
    order_id: ID,
    collateral: Balance<T>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let market_id = object::id(market);
    let order: &mut Order<T> = market.orders.borrow_mut(order_id);
    let minimum_fill_amount = market.collateral_types.get(&type_name::get<T>()).minimum_amount;

    // check if not order owner
    assert!(order.by != ctx.sender(), E_INVALID_ORDER_OWNER);
    // check if collateral is not too much
    assert!(collateral.value() <= order.collateral.value(), E_TOO_MUCH_COLLATERAL);
    // check if collateral is enough to fill the order
    assert!(collateral.value() >= minimum_fill_amount, E_INSUFFICIENT_COLLATERAL);

    // check if order is fully filled
    let will_delete_order = collateral.value() == order.collateral.value();
    let amount_left = order.collateral.value() - collateral.value();

    // check if order is partially filled
    if (!will_delete_order) {
        // ensure that amount left is more than minimum fill amount
        assert!(amount_left >= minimum_fill_amount, E_AMOUNT_LEFT_NOT_ENOUGH);
    };

    let filled_order_id = object::new(ctx);

    event::emit(OrderFilled {
        market_id,
        order_id: *filled_order_id.as_inner(),
        filled_order_id: *filled_order_id.as_inner(),
        rate: order.rate,
        maker_collateral_amount_left: amount_left,
        collateral_amount: collateral.value(),
        collateral_type: type_name::get<T>(),
    });

    let filled_order = FilledOrder<T> {
        id: filled_order_id,
        market_id: order.market_id,
        is_buy: order.is_buy,
        maker: order.by,
        taker: ctx.sender(),
        maker_collateral: order.collateral.split(collateral.value()),
        taker_collateral: collateral,
        rate: order.rate,
        created_at: order.created_at,
        filled_at: clock.timestamp_ms(),
    };

    register_order_owner(&mut order_owner_table.owners, ctx.sender(), ctx);
    modify_order_owner(
        &mut order_owner_table.owners,
        object::id(&filled_order),
        ModifyOrderType::FilledOrder,
        true,
        ctx.sender(),
        ctx,
    );
    modify_order_owner(
        &mut order_owner_table.owners,
        object::id(&filled_order),
        ModifyOrderType::FilledOrder,
        true,
        order.by,
        ctx,
    );

    market.filled_orders.add(object::id(&filled_order), filled_order);

    if (will_delete_order) {
        modify_order_owner(
            &mut order_owner_table.owners,
            order_id,
            ModifyOrderType::Order,
            false,
            order.by,
            ctx,
        );
        let o: Order<T> = market.orders.remove(order_id);
        let Order { id, collateral, .. } = o;
        collateral.destroy_zero();
        id.delete();
    }
}

public fun settle_order<T, C>(
    market: &mut PreMarket,
    order_owner_table: &mut OrderOwnerTable,
    filled_order_id: ID,
    final_coin: Coin<C>,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<T> {
    // check if market is resolved and settlement is before delivery time
    assert!(market.resolution.is_some(), E_MARKET_NOT_RESOLVED);
    let resolution = market.resolution.borrow();
    assert!(clock.timestamp_ms() <= resolution.delivery_before, E_MARKET_DELIVERY_TIME_PAST);

    // check if filled order exists
    let FilledOrder<T> {
        id,
        maker_collateral,
        mut taker_collateral,
        maker,
        taker,
        is_buy,
        rate,
        ..,
    } = market.filled_orders.remove(filled_order_id);

    let (buyer, seller) = match (is_buy) {
        true => (maker, taker), // maker is the buyer
        false => (taker, maker), // taker is the buyer
    };

    // check if settled by the one who sell the coin -> seller need to provide the coin
    assert!(seller == ctx.sender(), E_INVALID_SETTLED_BY);

    // check if final coin type is correct
    assert!(type_name::get<C>() == resolution.coin_type, E_INVALID_FINAL_COIN_TYPE);

    // calculate the rate that the taker will get
    let mut final_coin_correct_balance = maker_collateral.value() as u128;
    // decimal adjustment
    final_coin_correct_balance = final_coin_correct_balance * (MIST as u128);
    final_coin_correct_balance = final_coin_correct_balance / (resolution.rate as u128);
    // convert to coin rate
    final_coin_correct_balance = final_coin_correct_balance * (MIST as u128);
    final_coin_correct_balance = final_coin_correct_balance / (rate as u128);
    let final_coin_correct_balance = final_coin_correct_balance as u64;
    assert!(final_coin.value() >= final_coin_correct_balance, E_INVALID_FINAL_COIN_AMOUNT);

    // create settled order for buyer to claim the coin later
    let settled_order = SettledOrder<C> {
        id: object::new(ctx),
        claimer: buyer,
        balance: final_coin.into_balance(),
        settled_at: clock.timestamp_ms(),
    };

    event::emit(OrderSettled {
        market_id: object::id(market),
        filled_order_id,
        settled_order_id: object::id(&settled_order),
    });

    market.settled_orders.add(object::id(&settled_order), settled_order);
    object::delete(id);

    // remove filled order from order owner table
    // add settled order for buyer to claim the coin later
    modify_order_owner(
        &mut order_owner_table.owners,
        filled_order_id,
        ModifyOrderType::FilledOrder,
        false,
        taker,
        ctx,
    );
    modify_order_owner(
        &mut order_owner_table.owners,
        filled_order_id,
        ModifyOrderType::FilledOrder,
        false,
        maker,
        ctx,
    );
    modify_order_owner(
        &mut order_owner_table.owners,
        filled_order_id,
        ModifyOrderType::SettledOrder,
        true,
        buyer,
        ctx,
    );

    // take fee out
    let fee_value = taker_collateral.value() * market.settle_fee_rate_bps / 10_000;
    let fee_coin = taker_collateral.split(fee_value).into_coin(ctx);
    transfer::public_transfer(fee_coin, market.fee_addr);

    // return the rest to the buyer (collateral + value of coin - fee)
    taker_collateral.join(maker_collateral);
    let return_coin = taker_collateral.into_coin(ctx);

    return_coin
}

public fun claim_order<C>(
    market: &mut PreMarket,
    order_owner_table: &mut OrderOwnerTable,
    settled_order_id: ID,
    ctx: &mut TxContext,
): Coin<C> {
    let SettledOrder<C> {
        id,
        claimer,
        mut balance,
        ..,
    } = market.settled_orders.remove(settled_order_id);

    // check if claimer is the one who should claim the order
    assert!(claimer == ctx.sender(), E_INVALID_CLAIMER);

    event::emit(OrderClaimed {
        market_id: object::id(market),
        settled_order_id,
    });

    // remove settled order from order owner table
    modify_order_owner(
        &mut order_owner_table.owners,
        settled_order_id,
        ModifyOrderType::SettledOrder,
        false,
        claimer,
        ctx,
    );
    id.delete();

    let fee_value = balance.value() * market.buy_fee_rate_bps / 10_000;
    let fee_coin = balance.split(fee_value).into_coin(ctx);
    transfer::public_transfer(fee_coin, market.fee_addr);

    balance.into_coin(ctx)
}

public fun close_order<T>(
    market: &mut PreMarket,
    order_owner_table: &mut OrderOwnerTable,
    filled_order_id: ID,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<T> {
    // check if past delivery time
    assert!(market.resolution.is_some(), E_MARKET_NOT_RESOLVED);
    let resolution = market.resolution.borrow();
    assert!(clock.timestamp_ms() > resolution.delivery_before, E_MARKET_DELIVERY_TIME_NOT_PAST);

    let FilledOrder<T> {
        id,
        maker_collateral,
        mut taker_collateral,
        is_buy,
        maker,
        taker,
        ..,
    } = market.filled_orders.remove(filled_order_id);

    let buyer = match (is_buy) {
        true => maker,
        false => taker,
    };

    // must be closed by the buyer
    assert!(buyer == ctx.sender(), E_INVALID_ORDER_OWNER);

    event::emit(OrderClosed {
        market_id: object::id(market),
        filled_order_id,
    });

    // remove filled order from order owner table
    modify_order_owner(
        &mut order_owner_table.owners,
        filled_order_id,
        ModifyOrderType::FilledOrder,
        false,
        maker,
        ctx,
    );
    modify_order_owner(
        &mut order_owner_table.owners,
        filled_order_id,
        ModifyOrderType::FilledOrder,
        false,
        taker,
        ctx,
    );

    object::delete(id);

    // take fee out
    let fee_value = taker_collateral.value() * market.penalty_fee_rate_bps / 10_000;
    let fee_coin = taker_collateral.split(fee_value).into_coin(ctx);
    transfer::public_transfer(fee_coin, market.fee_addr);

    // return the rest to the buyer (collateral + value of coin - fee)
    taker_collateral.join(maker_collateral);
    let return_coin = taker_collateral.into_coin(ctx);

    return_coin
}
