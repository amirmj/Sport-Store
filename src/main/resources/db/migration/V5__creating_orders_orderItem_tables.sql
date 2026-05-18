create table orders
(
    id          bigint auto_increment,
    customer_id bigint                                   not null,
    status      varchar(20)                              not null,
    created_at  datetime       default current_timestamp not null,
    total_price decimal(10, 2) default 0.0               not null,
    constraint orders_pk
        primary key (id),
    constraint orders_users_id_fk
        foreign key (customer_id) references users (id)
);

###########################

create table order_Items
(
    id          bigint auto_increment,
    order_id    bigint                     not null,
    product_id  bigint                     not null,
    unite_price decimal(10, 2) default 0.0 not null,
    quantity    int            default 1   not null,
    total_price decimal(10, 2) default 0.0 not null,
    constraint order_Items_pk
        primary key (id),
    constraint order_Items_orders_id_fk
        foreign key (order_id) references orders (id)
            on delete cascade,
    constraint order_Items_products_id_fk
        foreign key (product_id) references products (id)
);


